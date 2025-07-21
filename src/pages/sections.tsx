// sections.tsx - Updated
import { useState } from 'react';
import Add from "../components/layers/AddMoreSections/addMore";
import MySite from "../components/layers/MySite/Mysite";
import { DragDropProvider } from "../context/DragandDropContex";
import { UnifiedDragDropSection } from "./DragandDrop/unifiedDragandDropSystem.tsx";

const Sections = () => {
    const [activeTab, setActiveTab] = useState<'edit' | 'reorder'>('edit');

    return (
        <DragDropProvider>
            <div className="flex flex-wrap justify-center w-full p-4 mt-4">
                <div className="max-w-2xl transform scale-[0.9] origin-top">
                    <MySite />

                    {/* Tab Navigation */}
                    <div className="mb-6 mt-10">
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                            <button
                                onClick={() => setActiveTab('edit')}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'edit'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Add Sections</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('reorder')}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'reorder'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                    <span>Reorder</span>
                                </div>
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'edit' ? (
                            <Add />
                        ) : (
                            <div>
                                <h3 className="text-gray-600 text-lg font-medium mb-4">Reorder sections</h3>
                                <UnifiedDragDropSection className="mb-6" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DragDropProvider>
    );
};

export default Sections;
