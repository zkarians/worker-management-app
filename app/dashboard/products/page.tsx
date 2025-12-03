'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/app/components/GlassCard';
import { Package, Search, Plus, Settings, Edit2, Trash2, Box, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { useUser } from '@/app/components/UserContext';
import { ProductModal } from '@/app/components/ProductModal';
import { CategoryManagerModal } from '@/app/components/CategoryManagerModal';
import * as XLSX from 'xlsx';

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    width: number;
    depth: number;
    height: number;
    weight?: number | null;
    cbm?: number | null;
    division?: string | null;
    notes?: string | null;  // 비고 필드 추가
    categoryId: string | null;
    category?: Category;
    author?: { name: string };
}

export default function ProductsPage() {
    const user = useUser();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (data.categories) setCategories(data.categories);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const url = searchTerm
                ? `/api/products?search=${encodeURIComponent(searchTerm)}`
                : '/api/products';
            const res = await fetch(url);
            const data = await res.json();
            if (data.products) setProducts(data.products);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async (productData: any) => {
        try {
            const url = '/api/products';
            const method = editingProduct ? 'PUT' : 'POST';
            const body = editingProduct ? { ...productData, id: editingProduct.id } : productData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Failed to save product');

            fetchProducts();
            setIsProductModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error(error);
            alert('제품 저장에 실패했습니다.');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
            fetchProducts();
        } catch (error) {
            console.error(error);
            alert('삭제 실패');
        }
    };

    const handleAddCategory = async (name: string) => {
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (!res.ok) throw new Error('Failed');
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert('카테고리 추가 실패');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('카테고리를 삭제하시겠습니까?')) return;
        try {
            await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert('삭제 실패');
        }
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                '제품명': '예시 제품',
                '카테고리': '일반',
                '가로': 100,
                '세로': 50,
                '높이': 30,
                '무게': 10.5,
                'CBM': 0.15,
                '사업부': '영업1팀',
                '비고': '비고 사항 입력'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, '제품등록_양식.xlsx');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert('데이터가 없습니다.');
                    return;
                }

                // Map Korean headers to API fields
                const formattedData = data.map((item: any) => ({
                    name: item['제품명'],
                    categoryName: item['카테고리'],
                    width: item['가로'],
                    depth: item['세로'],
                    height: item['높이'],
                    weight: item['무게'],
                    cbm: item['CBM'],
                    division: item['사업부'],
                    notes: item['비고']
                }));

                // Validate required fields
                const invalidItems = formattedData.filter((item: any) => !item.name || !item.width || !item.depth || !item.height);
                if (invalidItems.length > 0) {
                    alert(`필수 정보(제품명, 가로, 세로, 높이)가 누락된 항목이 ${invalidItems.length}개 있습니다. 확인 후 다시 시도해주세요.`);
                    return;
                }

                if (!confirm(`${formattedData.length}개의 제품을 등록/수정하시겠습니까?`)) return;

                setLoading(true);
                const res = await fetch('/api/products/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ products: formattedData })
                });

                const result = await res.json();
                if (res.ok) {
                    alert(result.message);
                    fetchProducts();
                    fetchCategories(); // Categories might have been added
                } else {
                    throw new Error(result.error || 'Upload failed');
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('업로드 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
                // Reset input
                e.target.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const isManager = user?.role === 'MANAGER';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Package /> 제품 정보
                </h1>
                <div className="flex gap-2">
                    {isManager && (
                        <>
                            <input
                                type="file"
                                id="excel-upload"
                                accept=".xlsx, .xls"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={() => document.getElementById('excel-upload')?.click()}
                                className="glass-button bg-white text-green-600 border-slate-200 flex items-center gap-2"
                                title="엑셀 업로드"
                            >
                                <FileSpreadsheet size={18} />
                                <span className="hidden sm:inline">엑셀 업로드</span>
                            </button>
                            <button
                                onClick={handleDownloadTemplate}
                                className="glass-button bg-white text-slate-600 border-slate-200 flex items-center gap-2"
                                title="양식 다운로드"
                            >
                                <Download size={18} />
                            </button>
                            <div className="w-px h-8 bg-slate-200 mx-1"></div>
                            <button
                                onClick={() => setIsCategoryModalOpen(true)}
                                className="glass-button bg-white text-slate-600 border-slate-200 flex items-center gap-2"
                            >
                                <Settings size={18} />
                                <span className="hidden sm:inline">카테고리</span>
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setIsProductModalOpen(true);
                        }}
                        className="btn-primary glass-button flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">제품 추가</span>
                    </button>
                </div>
            </div>

            <GlassCard className="flex gap-4 bg-white border-slate-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="제품명 검색 (첫 글자부터 일치)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full glass-input pl-10 bg-slate-50 border-slate-200"
                    />
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {products.map(product => (
                    <GlassCard key={product.id} className="bg-white border-slate-200 p-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full inline-block">
                                        {product.category?.name || '미분류'}
                                    </span>
                                    {product.author && (
                                        <span className="text-[9px] text-slate-400">
                                            {product.author.name}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 leading-tight">{product.name}</h3>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => {
                                        setEditingProduct(product);
                                        setIsProductModalOpen(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-center mt-2">
                            <div className="bg-slate-50 p-1.5 rounded">
                                <p className="text-[9px] text-slate-500 mb-0.5">사업부</p>
                                <p className="text-xs font-semibold text-slate-900">{product.division || '-'}</p>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded">
                                <p className="text-[9px] text-slate-500 mb-0.5">가로</p>
                                <p className="text-xs font-semibold text-slate-900">{product.width}</p>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded">
                                <p className="text-[9px] text-slate-500 mb-0.5">세로</p>
                                <p className="text-xs font-semibold text-slate-900">{product.depth}</p>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded">
                                <p className="text-[9px] text-slate-500 mb-0.5">높이</p>
                                <p className="text-xs font-semibold text-slate-900">{product.height}</p>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded">
                                <p className="text-[9px] text-slate-500 mb-0.5">무게</p>
                                <p className="text-xs font-semibold text-slate-900">{product.weight || '-'}</p>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded">
                                <p className="text-[9px] text-slate-500 mb-0.5">CBM</p>
                                <p className="text-xs font-semibold text-slate-900">{product.cbm || '-'}</p>
                            </div>
                        </div>

                        {/* 비고 표시 */}
                        {product.notes && (
                            <div className="mt-2 pt-2 border-t border-slate-100">
                                <p className="text-[9px] text-slate-500 mb-0.5">비고</p>
                                <p className="text-xs text-slate-700 leading-relaxed">{product.notes}</p>
                            </div>
                        )}
                    </GlassCard>
                ))}

                {!loading && products.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Box size={48} className="mx-auto mb-4 opacity-20" />
                        <p>등록된 제품이 없습니다.</p>
                    </div>
                )}
            </div>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                }}
                onSave={handleSaveProduct}
                categories={categories}
                initialData={editingProduct}
            />

            <CategoryManagerModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={categories}
                onAdd={handleAddCategory}
                onDelete={handleDeleteCategory}
            />
        </div>
    );
}
