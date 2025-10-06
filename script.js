// 图片转PDF工具 - 核心脚本

// 全局状态管理
const state = {
    uploadedImages: [],
    isGenerating: false
};

// DOM 元素引用
const elements = {
    fileInput: document.getElementById('fileInput'),
    uploadZone: document.getElementById('uploadZone'),
    previewContainer: document.getElementById('previewContainer'),
    imageGrid: document.getElementById('imageGrid'),
    imageCount: document.getElementById('imageCount'),
    pageSizeSelect: document.getElementById('pageSizeSelect'),
    orientationSelect: document.getElementById('orientationSelect'),
    marginInput: document.getElementById('marginInput'),
    generatePdfBtn: document.getElementById('generatePdfBtn'),
    clearBtn: document.getElementById('clearBtn'),
    statusMessage: document.getElementById('statusMessage')
};

// 初始化应用
function initApp() {
    setupEventListeners();
    
    // 移动端触摸优化
    if ('ontouchstart' in window) {
        setupTouchEvents();
    }
    
    updateUIState();
}

// 设置事件监听器
function setupEventListeners() {
    // 文件输入事件
    elements.fileInput.addEventListener('change', handleFileSelection);
    
    // 拖放事件
    elements.uploadZone.addEventListener('dragover', handleDragOver);
    elements.uploadZone.addEventListener('dragleave', handleDragLeave);
    elements.uploadZone.addEventListener('drop', handleDrop);
    elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
    
    // 按钮事件
    elements.generatePdfBtn.addEventListener('click', handleGeneratePDF);
    elements.clearBtn.addEventListener('click', handleClearImages);
    
    // 设置更改事件
    elements.pageSizeSelect.addEventListener('change', updateUIState);
    elements.orientationSelect.addEventListener('change', updateUIState);
    elements.marginInput.addEventListener('input', updateUIState);
}

// 处理文件选择
function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    processUploadedFiles(files);
    // 清空文件输入，允许重复上传相同文件
    elements.fileInput.value = '';
}

// 处理拖放事件
function handleDragOver(event) {
    event.preventDefault();
    elements.uploadZone.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    elements.uploadZone.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    elements.uploadZone.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    processUploadedFiles(files);
}

// 处理上传的文件
function processUploadedFiles(files) {
    if (files.length === 0) return;
    
    showStatus('正在处理图片...', 'info');
    
    // 过滤出图片文件
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        showStatus('未找到有效图片文件', 'error');
        return;
    }
    
    // 处理每张图片
    imageFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // 创建图片对象
            const img = new Image();
            
            img.onload = () => {
                // 添加到状态
                const imageInfo = {
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    src: e.target.result,
                    name: file.name,
                    width: img.width,
                    height: img.height
                };
                
                state.uploadedImages.push(imageInfo);
                addImageToPreview(imageInfo);
                updateUIState();
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            showStatus(`无法读取文件: ${file.name}`, 'error');
        };
        
        reader.readAsDataURL(file);
    });
    
    showStatus(`成功上传 ${imageFiles.length} 张图片`, 'success');
}

// 添加图片到预览区域
function addImageToPreview(imageInfo) {
    const previewItem = document.createElement('div');
    previewItem.className = 'image-preview-item';
    previewItem.dataset.id = imageInfo.id;
    
    previewItem.innerHTML = `
        <div class="preview-thumbnail">
            <img src="${imageInfo.src}" alt="${imageInfo.name}" loading="lazy">
        </div>
        <div class="preview-info">
            <span class="preview-name">${truncateText(imageInfo.name, 12)}</span>
            <button class="remove-image-btn" title="移除图片" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;
    
    // 添加移除按钮事件
    const removeBtn = previewItem.querySelector('.remove-image-btn');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeImage(imageInfo.id);
    });
    
    // 添加键盘支持
    previewItem.setAttribute('tabindex', '0');
    previewItem.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            removeImage(imageInfo.id);
        }
    });
    
    elements.imageGrid.appendChild(previewItem);
}

// 移除图片
function removeImage(imageId) {
    // 从状态中移除
    state.uploadedImages = state.uploadedImages.filter(img => img.id !== imageId);
    
    // 从DOM中移除（带动画）
    const previewItem = elements.imageGrid.querySelector(`[data-id="${imageId}"]`);
    if (previewItem) {
        // 添加淡出动画
        previewItem.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        previewItem.style.opacity = '0';
        previewItem.style.transform = 'scale(0.9) translateY(-10px)';
        
        setTimeout(() => {
            previewItem.remove();
            updateUIState();
        }, 200);
    } else {
        updateUIState();
    }
    
    showStatus('图片已移除', 'info');
}

// 移动端触摸事件优化
function setupTouchEvents() {
    // 为图片预览项添加触摸反馈
    elements.imageGrid.addEventListener('touchstart', (e) => {
        const previewItem = e.target.closest('.image-preview-item');
        if (previewItem) {
            previewItem.style.transform = 'scale(0.98)';
            previewItem.style.transition = 'transform 0.1s ease-out';
        }
    }, { passive: true });
    
    elements.imageGrid.addEventListener('touchend', (e) => {
        const previewItem = e.target.closest('.image-preview-item');
        if (previewItem) {
            setTimeout(() => {
                previewItem.style.transform = '';
                previewItem.style.transition = '';
            }, 100);
        }
    }, { passive: true });
    
    // 为按钮添加触摸反馈
    document.addEventListener('touchstart', (e) => {
        const button = e.target.closest('button:not(:disabled)');
        if (button) {
            button.style.transform = 'scale(0.95)';
            button.style.transition = 'transform 0.1s ease-out';
        }
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        const button = e.target.closest('button:not(:disabled)');
        if (button) {
            setTimeout(() => {
                button.style.transform = '';
                button.style.transition = '';
            }, 100);
        }
    }, { passive: true });
}

// 清空所有图片
function handleClearImages() {
    if (state.isGenerating) return;
    
    if (confirm('确定要清空所有已上传的图片吗？')) {
        state.uploadedImages = [];
        elements.imageGrid.innerHTML = '';
        updateUIState();
        showStatus('图片列表已清空', 'info');
    }
}

// 生成PDF
function handleGeneratePDF() {
    if (state.isGenerating || state.uploadedImages.length === 0) return;
    
    try {
        state.isGenerating = true;
        updateUIState();
        showStatus('正在生成PDF...', 'info');
        
        // 创建PDF定义
        const docDefinition = createPdfDefinition();
        
        // 生成PDF并下载
        pdfMake.createPdf(docDefinition).download('图片转PDF.pdf');
        
        showStatus('PDF生成成功！', 'success');
        
    } catch (error) {
        console.error('PDF生成错误:', error);
        showStatus('PDF生成失败，请重试', 'error');
    } finally {
        state.isGenerating = false;
        updateUIState();
    }
}

// 创建PDF文档定义 - 确保图片保持原始比例完整显示，不填满页面
function createPdfDefinition() {
    const pageSize = elements.pageSizeSelect.value;
    const orientation = elements.orientationSelect.value;
    const margin = parseInt(elements.marginInput.value);
    
    // 创建PDF文档基础定义
    const docDefinition = {
        pageSize: pageSize,
        pageOrientation: orientation,
        pageMargins: [margin, margin, margin, margin],
        content: []
    };
    
    // 为每张上传的图片创建单独页面
    state.uploadedImages.forEach((imageInfo, index) => {
        // 计算可用的页面宽度和高度（减去边距）
        const availableWidth = getPageWidth(pageSize, orientation, margin) - (margin * 2);
        const availableHeight = getPageHeight(pageSize, orientation, margin) - (margin * 2);
        
        // 计算图片缩放比例，确保完整显示在页面内
        const widthRatio = availableWidth / imageInfo.width;
        const heightRatio = availableHeight / imageInfo.height;
        const scaleRatio = Math.min(widthRatio, heightRatio, 1); // 最大不超过100%
        
        // 计算最终显示尺寸
        const displayWidth = imageInfo.width * scaleRatio;
        const displayHeight = imageInfo.height * scaleRatio;
        
        // 创建图片内容，设置合适的尺寸
        const pageContent = {
            image: imageInfo.src,
            width: displayWidth,
            height: displayHeight,
            alignment: 'center'
        };
        
        // 对除最后一张图片外的所有图片添加分页符
        if (index < state.uploadedImages.length - 1) {
            pageContent.pageBreak = 'after';
        }
        
        docDefinition.content.push(pageContent);
    });
    
    return docDefinition;
}

// 辅助函数：获取页面宽度
function getPageWidth(pageSize, orientation, margin) {
    // 标准页面尺寸（单位：点）
    const pageSizes = {
        'A4': { width: 595, height: 842 },
        'A3': { width: 842, height: 1191 },
        'A5': { width: 420, height: 595 },
        'Letter': { width: 612, height: 792 },
        'Legal': { width: 612, height: 1008 }
    };
    
    const size = pageSizes[pageSize] || pageSizes['A4'];
    return orientation === 'portrait' ? size.width : size.height;
}

// 辅助函数：获取页面高度
function getPageHeight(pageSize, orientation, margin) {
    // 标准页面尺寸（单位：点）
    const pageSizes = {
        'A4': { width: 595, height: 842 },
        'A3': { width: 842, height: 1191 },
        'A5': { width: 420, height: 595 },
        'Letter': { width: 612, height: 792 },
        'Legal': { width: 612, height: 1008 }
    };
    
    const size = pageSizes[pageSize] || pageSizes['A4'];
    return orientation === 'portrait' ? size.height : size.width;
}

// 更新UI状态
function updateUIState() {
    const hasImages = state.uploadedImages.length > 0;
    
    // 更新图片计数
    elements.imageCount.textContent = state.uploadedImages.length;
    
    // 更新按钮状态
    elements.generatePdfBtn.disabled = !hasImages || state.isGenerating;
    elements.clearBtn.disabled = !hasImages || state.isGenerating;
    
    // 更新生成按钮文本
    elements.generatePdfBtn.textContent = state.isGenerating ? '正在生成...' : '生成 PDF';
    
    // 显示/隐藏预览容器
    elements.previewContainer.style.display = hasImages ? 'block' : 'none';
    
    // 更新按钮样式
    if (state.isGenerating) {
        elements.generatePdfBtn.classList.add('generating');
    } else {
        elements.generatePdfBtn.classList.remove('generating');
    }
}

// 显示状态消息
function showStatus(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message status-${type}`;
    elements.statusMessage.style.display = 'block';
    
    // 自动隐藏成功消息
    if (type === 'success') {
        setTimeout(() => {
            elements.statusMessage.style.display = 'none';
        }, 3000);
    }
}

// 辅助函数：截断文本
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// 页面加载完成后初始化应用
window.addEventListener('DOMContentLoaded', initApp);