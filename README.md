# 🖼️ 图片转PDF工具

一个简洁优雅的在线工具，帮助您将多张图片快速合并成一个PDF文件。支持自定义页面大小、方向和边距，让您的文档转换更加灵活。

## ✨ 主要功能

- 📸 **多图片支持** - 支持JPG、PNG、GIF等常见图片格式
- 📄 **自定义PDF设置** - 可选择A4、A3、A5、Letter等多种页面大小
- 🔄 **方向选择** - 支持纵向和横向页面方向
- 📏 **边距调节** - 可自定义页面边距（0-100mm）
- 🎯 **拖拽上传** - 支持拖拽和点击两种上传方式
- 📱 **移动端优化** - 完美适配手机和平板设备
- ⚡ **快速处理** - 本地处理，无需等待上传
- 🎨 **优雅动画** - 流畅的交互动画效果
- ⌨️ **键盘支持** - 支持Delete键快速删除图片

## 🚀 快速开始

### 在线使用

1. 访问 [GitHub Pages](https://aether-1013.github.io/image-to-pdf-converter/)
2. 拖拽或点击上传图片
3. 设置PDF参数（页面大小、方向、边距）
4. 点击"生成PDF"按钮
5. 下载生成的PDF文件

### 本地部署

#### 方法一：使用HTTP服务器

```bash
# 克隆仓库
https://github.com/Aether-1013/image-to-pdf-converter.git
# 进入项目目录
cd image-to-pdf-tool

# 使用Python启动HTTP服务器
python -m http.server 8080

# 或使用Node.js的http-server
npx http-server -p 8080

# 或使用Live Server（VS Code插件）
# 右键点击index.html，选择"Open with Live Server"
```

#### 方法二：直接打开

由于使用了CDN资源，您也可以直接在浏览器中打开`index.html`文件使用。

## 📋 使用说明

### 上传图片

- **拖拽上传**：将图片文件拖拽到上传区域
- **点击上传**：点击上传区域选择图片文件
- **多选支持**：按住Ctrl/Cmd键可选择多张图片

### PDF设置

| 设置项 | 选项 |
|--------|------|
| 页面大小 | A4、A3、A5、Letter、Legal、Tabloid |
| 页面方向 | 纵向、横向 |
| 页面边距 | 0-100mm（可调） |

### 图片管理

- **预览**：鼠标悬停查看大图
- **删除**：点击删除按钮或按Delete键
- **清空**：一键清空所有图片

## 🛠️ 技术栈

- **HTML5** - 语义化标签结构
- **CSS3** - 现代样式和动画
- **JavaScript** - 原生JS实现，无框架依赖
- **pdfmake** - 客户端PDF生成库
- **SVG** - 矢量图标

## 🎨 设计特色

### 视觉设计
- 🌈 **渐变色系** - 现代化的渐变背景
- 📐 **网格布局** - 响应式CSS Grid布局
- ✨ **微动画** - 精心设计的交互动画
- 🎯 **视觉层次** - 清晰的信息架构

### 用户体验
- 📱 **移动优先** - 完美适配各种屏幕尺寸
- ⚡ **即时反馈** - 操作状态实时显示
- ♿ **无障碍** - 支持键盘导航和屏幕阅读器
- 🌍 **国际化** - 中文界面，简洁易懂

## 🔧 浏览器兼容性

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 60+ |
| Firefox | 55+ |
| Safari | 12+ |
| Edge | 79+ |

## 📁 项目结构

```
image-to-pdf-tool/
├── index.html          # 主页面文件
├── style.css           # 样式文件
├── script.js           # JavaScript逻辑
├── README.md           # 项目说明文档
└── LICENSE            # 开源许可证
```

## 🎯 核心代码

### 图片处理
```javascript
// 处理上传的图片文件
function processUploadedFiles(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const imageInfo = {
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    src: e.target.result,
                    name: file.name,
                    width: img.width,
                    height: img.height
                };
                state.uploadedImages.push(imageInfo);
                addImageToPreview(imageInfo);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
```

### PDF生成
```javascript
// 创建PDF文档定义
function createPdfDefinition() {
    const docDefinition = {
        pageSize: pageSize,
        pageOrientation: orientation,
        pageMargins: [margin, margin, margin, margin],
        content: []
    };
    
    state.uploadedImages.forEach((imageInfo, index) => {
        // 智能缩放算法，保持图片原始比例
        const scaleRatio = Math.min(widthRatio, heightRatio, 1);
        docDefinition.content.push({
            image: imageInfo.src,
            width: imageInfo.width * scaleRatio,
            height: imageInfo.height * scaleRatio,
            alignment: 'center'
        });
    });
    
    return docDefinition;
}
```

## 🎨 动画效果

### 图片弹出动画
```css
@keyframes gentlePopIn {
    0% {
        opacity: 0;
        transform: scale(0.9) translateY(10px);
    }
    60% {
        opacity: 1;
        transform: scale(1.02) translateY(-2px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
```

### 悬停效果
```css
.image-preview-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

### 开发建议
- 🐛 发现Bug请提交Issue
- 💡 有新功能想法欢迎讨论
- 🎨 UI/UX改进建议
- 📚 文档完善

### 开发环境
```bash
# 克隆项目
https://github.com/Aether-1013/image-to-pdf-converter.git

# 使用Live Server进行开发
# VS Code安装Live Server插件后，右键index.html选择"Open with Live Server"
```

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议，您可以自由使用、修改和分发。

## 🙏 致谢

- [pdfmake](https://pdfmake.github.io/) - 强大的客户端PDF生成库
- [GitHub](https://github.com) - 提供代码托管服务
- [VS Code](https://code.visualstudio.com/) - 优秀的代码编辑器

## 📞 联系方式

- **GitHub**: [@Aether-1013](https://github.com/Aether-1013)
- **项目地址**: [image-to-pdf-converter](https://github.com/Aether-1013/image-to-pdf-converter)

---

© 2025 Aether-1013 | 芙芙很可爱

⭐ 如果这个项目对您有帮助，请给个Star支持一下！
