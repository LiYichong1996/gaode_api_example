# 高德地图示例应用 / AMap Demo Application

这是一个基于React和高德地图API的示例应用，实现了POI搜索、地图展示、多模式路线规划等功能。

This is a React-based demo application using AMap API, featuring POI search, map display, multi-modal route planning and more.

## 功能特性 / Features

- ✅ 高德地图渲染（英文版界面） / AMap rendering (English interface)
- ✅ POI兴趣点搜索（全国搜索、周边搜索） / POI search (nationwide & nearby search)
- ✅ 地图标记显示 / Map marker display
- ✅ 侧边栏POI列表 / Sidebar POI list
- ✅ POI详情卡片 / POI detail cards
- ✅ **多模式导航路线规划 / Multi-modal route planning**
  - 🚗 驾车导航（包含过路费、红绿灯信息） / Driving navigation (with tolls & traffic lights)
  - 🚶 步行导航 / Walking navigation
  - 🚴 骑行导航 / Bicycling navigation  
  - 🛵 电动车导航 / Electric bike navigation
- ✅ 当前位置定位 / Current location positioning
- ✅ 路径规划2.0 API集成 / Route Planning 2.0 API integration
- ✅ **🧭 高德地图导航跳转**（一键跳转到高德地图APP导航） / AMap navigation redirect (one-click to AMap app)
- ✅ **📍 地图点击搜索**（点击地图任意位置搜索附近POI） / Map click search (click anywhere on map to search nearby POI)
- ✅ **🌍 位置信息显示**（点击地图显示详细地址和附近信息） / Location info display (click map to show detailed address and nearby info)
- ✅ 响应式设计 / Responsive design

## 使用说明 / Usage Instructions

### 1. 获取高德API Key / Get AMap API Key

1. 访问 [高德开放平台](https://lbs.amap.com/) / Visit [AMap Open Platform](https://lbs.amap.com/)
2. 注册账号并创建应用 / Register account and create application
3. 获取Web服务API Key / Get Web Service API Key
4. 在代码中已配置测试API Key，您也可以替换为自己的Key / Test API Key is pre-configured, you can replace it with your own

### 2. 安装依赖 / Install Dependencies

```bash
npm install
```

### 3. 启动应用 / Start Application

```bash
npm start
```

应用将在 `http://localhost:3000` 启动。/ Application will start at `http://localhost:3000`.

## 使用方法 / How to Use

### 搜索POI / POI Search
1. 在顶部搜索框输入关键词（如"餐厅"、"酒店"、"银行"等） / Enter keywords in the search box (e.g., "restaurant", "hotel", "bank")
2. 选择"全国搜索"或"周边搜索" / Choose "Nationwide Search" or "Nearby Search"
3. 地图上会显示相关的兴趣点标记 / Related POI markers will appear on the map
4. 右侧边栏会显示所有搜索结果的列表 / All search results will be listed in the right sidebar

### 多模式导航 / Multi-modal Navigation
1. 在顶部选择出行方式：🚗 驾车、🚶 步行、🚴 骑行、🛵 电动车 / Select transportation mode: 🚗 Driving, 🚶 Walking, 🚴 Bicycling, 🛵 E-bike
2. 点击POI标记或列表项查看详情 / Click POI markers or list items to view details
3. 在POI详情卡片中点击"导航"按钮 / Click "Navigation" button in POI detail card
4. 系统会根据当前选择的出行方式规划路线 / System will plan route based on selected transportation mode
5. 查看路线信息包括： / View route information including:
   - 距离和预计时间 / Distance and estimated time
   - 驾车模式：过路费、红绿灯数量 / Driving mode: tolls, traffic lights count
   - 其他模式：优化的步行/骑行路径 / Other modes: optimized walking/cycling paths

### 查看POI详情 / View POI Details
1. 点击地图上的标记点或右侧列表中的POI项 / Click map markers or POI items in right list
2. 会弹出POI详情卡片，显示名称、地址、类型、电话等信息 / POI detail card will popup showing name, address, type, phone, etc.
3. 可以点击"导航"按钮规划路线 / Click "Navigation" button to plan route

### 导航功能 / Navigation Features
1. 在POI详情卡片中点击"导航"按钮 / Click "Navigation" button in POI detail card
2. **智能起点判断 / Smart Origin Detection**：
   - 🎯 **优先使用点击位置**：如果您之前点击了地图，将使用点击位置作为导航起点 / **Prioritize clicked location**: If you clicked on map, will use clicked location as navigation origin
   - 📍 **备用当前位置**：如果没有点击位置，将使用您的当前GPS位置作为起点 / **Fallback to current location**: If no clicked location, will use your current GPS location as origin
3. 规划从起点到目标POI的路线 / Plan route from origin to target POI
4. 在右侧边栏显示详细路线信息，包括起点来源标识 / Display detailed route info in right sidebar, including origin source indicator
5. 地图上会显示完整的导航路线和起终点标记 / Complete navigation route and origin/destination markers will be shown on map
6. **🧭 跳转到高德地图导航**：点击"在高德地图中导航"按钮，可以直接跳转到高德地图APP进行真实导航 / **🧭 Jump to AMap Navigation**: Click "Navigate in AMap" button to jump to AMap app for real navigation

### 高德地图导航跳转 / AMap Navigation Redirect
- 在规划路线后，路线信息区域会显示"🧭 在高德地图中导航"按钮 / After route planning, "🧭 Navigate in AMap" button will appear in route info area
- 点击按钮会打开高德地图APP（手机端）或高德地图网页版（电脑端） / Click button to open AMap app (mobile) or AMap web version (desktop)
- 自动传递起点、终点和出行方式信息 / Automatically pass origin, destination and transportation mode info
- 支持驾车、步行、骑行等多种导航模式 / Support multiple navigation modes: driving, walking, bicycling, etc.

### 📍 地图点击搜索功能 / Map Click Search Feature
- **点击任意位置**：直接点击地图上的任意位置（不限于已搜索的POI） / **Click anywhere**: Directly click any location on the map (not limited to searched POIs)
- **🌍 显示位置信息**：自动弹出位置信息卡片，显示详细地址、坐标、附近地标等 / **🌍 Show location info**: Automatically popup location info card showing detailed address, coordinates, nearby landmarks, etc.
- **📍 位置详情包含**：完整地址、行政区划、精确坐标、附近POI、周边道路信息 / **📍 Location details include**: Complete address, administrative divisions, precise coordinates, nearby POIs, surrounding roads
- **🔍 快速搜索**：在位置信息卡片中点击"在此搜索POI"按钮进入搜索模式 / **🔍 Quick search**: Click "Search POI Here" button in location info card to enter search mode
- **📋 坐标复制**：一键复制精确坐标到剪贴板 / **📋 Copy coordinates**: One-click copy precise coordinates to clipboard
- **🎯 智能导航起点**：点击位置会自动成为后续导航的起点，在搜索区域显示"📍 清除起点"按钮 / **🎯 Smart navigation origin**: Clicked location automatically becomes navigation origin, "📍 Clear Origin" button appears in search area

## 主要技术栈 / Main Technology Stack

- **React** - 前端框架 / Frontend Framework
- **高德地图JavaScript API** - 地图服务 / Map Service
- **CSS3** - 样式设计 / Style Design
- **axios** - HTTP请求库 / HTTP Request Library

## 注意事项 / Notes

1. **API Key配置 / API Key Configuration**：请确保在 `public/index.html` 中替换为有效的高德API Key / Ensure to replace with a valid AMap API Key in `public/index.html`
2. **HTTPS要求 / HTTPS Requirement**：定位功能需要在HTTPS环境下使用 / Location features require HTTPS environment
3. **浏览器兼容性 / Browser Compatibility**：推荐使用现代浏览器 / Modern browsers recommended
4. **API配额 / API Quota**：注意高德API的调用次数限制 / Pay attention to AMap API call limits

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
