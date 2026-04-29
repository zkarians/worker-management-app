import os
import re
import json
import html as html_lib
from pathlib import Path

TBM_DIR = r"D:\.gemini\antigravity\scratch\TBM"
FILES_DIR = os.path.join(TBM_DIR, "TBM.files")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "tbm.json")

def read_text(path):
    for enc in ("cp949", "euc-kr", "utf-8", "latin-1"):
        try:
            with open(path, "r", encoding=enc, errors="replace") as f:
                return f.read()
        except Exception:
            continue
    return ""

def extract_meta(html):
    charset = None
    generator = None
    m1 = re.search(r'charset=([\w\-]+)', html, flags=re.I)
    if m1:
        charset = m1.group(1)
    m2 = re.search(r'<meta[^>]*name=["\']?Generator["\']?[^>]*content=["\']([^"\']+)["\']', html, flags=re.I)
    if m2:
        generator = m2.group(1)
    return {"charset": charset, "generator": generator}

def extract_tabs(html):
    tabs = []
    for m in re.finditer(r'c_rgszSh\[\d+\]\s*=\s*"([^"]+)"', html):
        tabs.append(m.group(1))
    return tabs

def extract_body_html(html):
    m = re.search(r'<body[^>]*>([\s\S]*?)</body>', html, flags=re.I)
    return m.group(1) if m else ""

def list_images(dir_path):
    exts = {".png", ".jpg", ".jpeg", ".gif", ".emz", ".bmp"}
    images = []
    for p in Path(dir_path).glob("*"):
        if p.suffix.lower() in exts:
            images.append(p.name)
    return images

def parse_attrs(tag):
    attrs = {}
    for k, v in re.findall(r'(\w+)=["\']([^"\']*)["\']', tag):
        attrs[k.lower()] = v
    return attrs

def strip_tags(text):
    text = re.sub(r'<script[\s\S]*?</script>', '', text, flags=re.I)
    text = re.sub(r'<style[\s\S]*?</style>', '', text, flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    return html_lib.unescape(text).strip()

def extract_tables(html):
    tables = []
    for tm in re.finditer(r'(<table[^>]*>)([\s\S]*?)</table>', html, flags=re.I):
        t_open = tm.group(1)
        t_inner = tm.group(2)
        t_attrs = parse_attrs(t_open)
        rows = []
        for rm in re.finditer(r'(<tr[^>]*>)([\s\S]*?)</tr>', t_inner, flags=re.I):
            r_open = rm.group(1)
            r_inner = rm.group(2)
            r_attrs = parse_attrs(r_open)
            cells = []
            for cm in re.finditer(r'(<t[dh][^>]*>)([\s\S]*?)</t[dh]>', r_inner, flags=re.I):
                c_open = cm.group(1)
                c_inner = cm.group(2)
                c_attrs = parse_attrs(c_open)
                cells.append({
                    "attrs": c_attrs,
                    "text": strip_tags(c_inner),
                    "html": c_inner
                })
            rows.append({"attrs": r_attrs, "cells": cells})
        tables.append({"attrs": t_attrs, "rows": rows})
    return tables

def main():
    main_html = read_text(os.path.join(TBM_DIR, "TBM.htm"))
    meta = extract_meta(main_html)
    tabs = extract_tabs(main_html)
    css_contents = {}
    for css_name in ("stylesheet.css",):
        css_path = os.path.join(FILES_DIR, css_name)
        if os.path.exists(css_path):
            css_contents[css_name] = read_text(css_path)
    root_css = os.path.join(TBM_DIR, "style.css")
    if os.path.exists(root_css):
        css_contents["style.css"] = read_text(root_css)
    images = list_images(FILES_DIR)
    sheet_files = sorted([p for p in Path(FILES_DIR).glob("sheet*.htm")], key=lambda x: x.name)
    sheets = []
    for idx, p in enumerate(sheet_files):
        html = read_text(str(p))
        body = extract_body_html(html)
        tables = extract_tables(body or html)
        sheets.append({
            "index": idx,
            "name": tabs[idx] if idx < len(tabs) else p.stem,
            "file": p.name,
            "html": html,
            "body_html": body,
            "tables": tables
        })
    data = {
        "meta": meta,
        "tabs": tabs,
        "resources": {
            "css": css_contents,
            "images": images
        },
        "frameset_html": main_html,
        "sheets": sheets
    }
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Written JSON: {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
