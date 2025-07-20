import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pois, setPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeMode, setRouteMode] = useState('driving'); // Route planning mode
  const [currentRoutePoi, setCurrentRoutePoi] = useState(null); // Current navigation target POI
  const [clickedLocation, setClickedLocation] = useState(null); // Map clicked location
  const [showLocationSearch, setShowLocationSearch] = useState(false); // Show location search window
  const [locationSearchKeyword, setLocationSearchKeyword] = useState(''); // 位置搜索关键词 - Location search keyword
  const [clickedLocationInfo, setClickedLocationInfo] = useState(null); // 点击位置详细信息 - Clicked location detailed info
  const [showLocationInfo, setShowLocationInfo] = useState(false); // 显示位置信息卡片 - Show location info card

  useEffect(() => {
    // 检查高德地图API是否加载 - Check if AMap API is loaded
    const checkAMapLoaded = () => {
      if (window.AMap) {
        console.log('AMap API loaded, version:', window.AMap.v);
        initMap();
      } else {
        console.error('AMap API not loaded, please check script tag');
        alert('AMap API not loaded, please check network connection or API Key configuration');
      }
    };

    // 初始化地图 - Initialize map
    const initMap = () => {
      try {
        // 适配AMap 2.0的配置 - 英文版 - AMap 2.0 configuration - English version
        const mapInstance = new window.AMap.Map('mapContainer', {
          zoom: 11,
          center: [116.397428, 39.90923], // 北京天安门 - Beijing Tiananmen
          viewMode: '3D',
          mapStyle: 'amap://styles/normal', // 添加地图样式 - Add map style
          lang: 'en' // 设置为英文 - Set to English
        });

        console.log('Map initialization successful');
        setMap(mapInstance);

        // 地图加载完成后的处理 - Handle map completion
        mapInstance.on('complete', function() {
          console.log('Map loading completed');
        });

        // 添加地图点击事件监听器 - Add map click event listener
        mapInstance.on('click', function(e) {
          const clickLng = e.lnglat.lng;
          const clickLat = e.lnglat.lat;
          console.log('地图点击位置:', { lng: clickLng, lat: clickLat });
          
          // 设置点击位置 - Set clicked location
          setClickedLocation([clickLng, clickLat]);
          
          // 获取点击位置的详细信息 - Get detailed info of clicked location
          getLocationInfo(clickLng, clickLat);
        });

        // 获取用户当前位置 - 适配2.0版本 - Get user current location - Adapted for 2.0 version
        window.AMap.plugin('AMap.Geolocation', function() {
          const geolocation = new window.AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            zoomToAccuracy: true,
            buttonPosition: 'RB'
          });

          geolocation.getCurrentPosition(function(status, result) {
            console.log('定位结果:', { status, result });
            if (status === 'complete') {
              setUserLocation([result.position.lng, result.position.lat]);
              mapInstance.setCenter([result.position.lng, result.position.lat]);
            } else {
              console.log('定位失败:', status, result);
            }
          });

          mapInstance.addControl(geolocation);
        });
      } catch (error) {
        console.error('Map initialization failed:', error);
        alert('Map initialization failed: ' + error.message);
      }
    };

    // 延迟检查，确保DOM加载完成 - Delayed check to ensure DOM is loaded
    setTimeout(checkAMapLoaded, 100);
  }, []);

  // 通过REST API测试Key有效性和搜索功能 - Test API key validity and search functionality via REST API
  const testAPIKeyWithRest = async () => {
    const apiKey = '266526b3ebb2bad7b327c4fd98595027';
    
    try {
      console.log('=== Web服务API测试开始 ===');
      
      // 测试1：IP定位API - Test 1: IP Location API
      console.log('1. 测试IP定位API...');
      const ipTestUrl = `https://restapi.amap.com/v3/ip?key=${apiKey}`;
      const ipResponse = await fetch(ipTestUrl);
      const ipData = await ipResponse.json();
      console.log('IP定位测试结果:', ipData);
      
      if (ipData.status === '1') {
        console.log('✅ IP定位API正常');
      } else {
        console.log('❌ IP定位API异常:', ipData.info);
      }
      
      // 测试2：POI搜索API - Test 2: POI Search API
      console.log('2. 测试POI搜索API...');
      const searchTestUrl = `https://restapi.amap.com/v3/place/text?keywords=Tiananmen Square Beijing&key=${apiKey}&offset=5&page=1&lang=en`;
      const searchResponse = await fetch(searchTestUrl);
      const searchData = await searchResponse.json();
      console.log('POI搜索测试结果:', searchData);
      
      if (searchData.status === '1' && searchData.pois && searchData.pois.length > 0) {
        console.log('✅ POI搜索API正常，找到', searchData.pois.length, '个结果');
        alert(`API Key verification successful!\n✅ IP Location: ${ipData.status === '1' ? 'Normal' : 'Abnormal'}\n✅ POI Search: Normal\nFound ${searchData.pois.length} test results`);
      } else {
        console.log('❌ POI搜索API异常:', searchData.info);
        alert(`API test partially failed\n✅ IP Location: ${ipData.status === '1' ? 'Normal' : 'Abnormal'}\n❌ POI Search: ${searchData.info || 'Abnormal'} (Error code: ${searchData.infocode})`);
      }
      
      console.log('=== Web服务API测试结束 ===');
      
    } catch (error) {
      console.error('API测试出错:', error);
      alert('Unable to connect to AMap API server, please check network connection: ' + error.message);
    }
  };

  // 测试API连接和Key有效性 - Test API connection and key validity
  const testAPI = async () => {
    console.log('=== API测试开始 ===');
    console.log('window.AMap存在:', !!window.AMap);
    
    if (window.AMap) {
      console.log('AMap版本:', window.AMap.v);
      
      // 测试插件加载 - Test plugin loading
      window.AMap.plugin(['AMap.PlaceSearch', 'AMap.Driving', 'AMap.Geolocation'], function() {
        console.log('✅ 所有插件加载成功');
        console.log('PlaceSearch可用:', !!window.AMap.PlaceSearch);
        console.log('Driving可用:', !!window.AMap.Driving);
        console.log('Geolocation可用:', !!window.AMap.Geolocation);
        
        // 测试搜索功能 - Test search functionality
        console.log('正在测试搜索功能...');
        const testSearch = new window.AMap.PlaceSearch({
          pageSize: 1,
          pageIndex: 1
        });
        
        testSearch.search('北京天安门', function(status, result) {
          console.log('搜索测试结果:', { status, result });
          if (status === 'complete' && result.poiList && result.poiList.pois) {
            console.log('✅ 搜索功能正常，找到结果:', result.poiList.pois.length, '个');
            alert('API function test successful! Search function works normally');
          } else {
            console.log('❌ 搜索功能异常:', result?.info || status);
            let errorMsg = '搜索功能测试失败: ';
            if (result?.info) {
              errorMsg += result.info;
              if (result.infocode) {
                errorMsg += ' (错误代码: ' + result.infocode + ')';
              }
            } else {
              errorMsg += status;
            }
            alert(errorMsg);
          }
        });
      });
      
      // 测试地图实例 - Test map instance
      try {
        const testMap = new window.AMap.Map(null, {
          zoom: 10,
          center: [116.397428, 39.90923]
        });
        console.log('✅ 地图实例创建成功');
        testMap.destroy();
        
      } catch (error) {
        console.log('❌ 地图实例创建失败:', error);
        alert('Map function abnormal: ' + error.message);
      }
    } else {
      console.log('❌ 高德地图API未加载');
      alert('AMap API not loaded, please check network connection');
    }
    
    console.log('当前地图实例存在:', !!map);
    console.log('=== API测试结束 ===');
  };

  // 周边搜索功能 - Nearby search function
  const searchNearby = async () => {
    if (!map || !searchKeyword.trim() || !userLocation) {
      alert('Please enter search keywords and ensure current location is obtained');
      return;
    }

    console.log('开始周边搜索:', searchKeyword, '位置:', userLocation);

    // 清除之前的搜索结果 - Clear previous search results
    map.clearMap();
    setPois([]);
    setSelectedPoi(null);
    setRouteInfo(null);
    setShowRoute(false);

    const apiKey = '266526b3ebb2bad7b327c4fd98595027';
    const location = `${userLocation[0]},${userLocation[1]}`;
    const searchUrl = `https://restapi.amap.com/v3/place/around?location=${location}&keywords=${encodeURIComponent(searchKeyword)}&radius=10000&key=${apiKey}&offset=20&page=1&extensions=all&lang=en`;

    try {
      console.log('调用周边搜索API...');
      const response = await fetch(searchUrl);
      const result = await response.json();
      
      console.log('周边搜索结果:', result);
      
      if (result.status === '1' && result.pois && result.pois.length > 0) {
        const poiData = result.pois.map((poi, index) => ({
          id: index,
          name: poi.name,
          address: poi.address || '地址信息不详',
          location: poi.location ? poi.location.split(',').map(Number) : [0, 0],
          type: poi.type || '未知类型',
          tel: poi.tel || '暂无电话',
          distance: poi.distance,
          typecode: poi.typecode
        }));
        
        console.log('处理后的POI数据:', poiData);
        setPois(poiData);

        // 在地图上添加标记
        poiData.forEach((poi, index) => {
          if (poi.location[0] !== 0 && poi.location[1] !== 0) {
            const marker = new window.AMap.Marker({
              position: poi.location,
              title: poi.name,
              label: {
                content: `${index + 1}`,
                direction: 'center'
              }
            });

            marker.on('click', () => {
              setSelectedPoi(poi);
              map.setCenter(poi.location);
              map.setZoom(15);
            });

            map.add(marker);
          }
        });

        // 调整地图视野以显示所有POI - Adjust map view to show all POIs (nearby)
        map.setFitView();
      } else {
        alert(result.info || 'No relevant results found, please try other keywords');
      }
    } catch (error) {
      console.error('周边搜索失败:', error);
      alert('Search failed, please check network connection: ' + error.message);
    }
  };

  // POI搜索功能 - 使用Web服务API - POI search function using Web Service API
  const searchPOI = async () => {
    if (!map || !searchKeyword.trim()) {
      console.log('搜索条件不满足:', { map: !!map, searchKeyword });
      alert('Please enter search keywords');
      return;
    }

    console.log('开始搜索:', searchKeyword);

    // 清除之前的搜索结果 - Clear previous search results
    map.clearMap();
    setPois([]);
    setSelectedPoi(null);
    setRouteInfo(null);
    setShowRoute(false);

    const apiKey = '266526b3ebb2bad7b327c4fd98595027';
    const searchUrl = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(searchKeyword)}&key=${apiKey}&offset=20&page=1&extensions=all&lang=en`;

    try {
      console.log('调用Web服务API搜索...');
      const response = await fetch(searchUrl);
      const result = await response.json();
      
      console.log('Web API搜索结果:', result);
      
      if (result.status === '1' && result.pois && result.pois.length > 0) {
        const poiData = result.pois.map((poi, index) => ({
          id: index,
          name: poi.name,
          address: poi.address || '地址信息不详',
          location: poi.location ? poi.location.split(',').map(Number) : [0, 0],
          type: poi.type || '未知类型',
          tel: poi.tel || '暂无电话',
          distance: poi.distance,
          typecode: poi.typecode
        }));
        
        console.log('处理后的POI数据:', poiData);
        setPois(poiData);

        // 在地图上添加标记
        poiData.forEach((poi, index) => {
          if (poi.location[0] !== 0 && poi.location[1] !== 0) {
            const marker = new window.AMap.Marker({
              position: poi.location,
              title: poi.name,
              label: {
                content: `${index + 1}`,
                direction: 'center'
              }
            });

            marker.on('click', () => {
              setSelectedPoi(poi);
              map.setCenter(poi.location);
              map.setZoom(15);
            });

            map.add(marker);
          }
        });

        // 调整地图视野以显示所有POI - Adjust map view to show all POIs (text search)
        if (poiData.length > 0) {
          map.setFitView();
        }
      } else {
        console.log('搜索结果为空或失败:', result);
        if (result.status === '0') {
          alert(`Search failed: ${result.info} (Error code: ${result.infocode})`);
        } else {
          alert('No relevant results found, please try other keywords');
        }
      }
    } catch (error) {
      console.error('API调用失败:', error);
      alert('Search failed, please check network connection: ' + error.message);
    }
  };

  // 多种出行方式的导航功能 - 使用路径规划2.0 API - Multi-modal navigation function using Route Planning 2.0 API
  const showNavigation = async (targetPoi, mode = routeMode) => {
    // 判断起点来源：优先使用点击位置，其次使用用户当前位置 - Determine origin: prioritize clicked location, then user location
    let originLocation = null;
    let originName = '';
    
    if (clickedLocation) {
      // 使用点击位置作为起点 - Use clicked location as origin
      originLocation = clickedLocation;
      originName = '点击位置 / Clicked Location';
      console.log('使用点击位置作为导航起点:', originLocation);
    } else if (userLocation) {
      // 使用用户当前位置作为起点 - Use user location as origin  
      originLocation = userLocation;
      originName = '当前位置 / Current Location';
      console.log('使用用户当前位置作为导航起点:', originLocation);
    } else {
      alert('Cannot get origin location, please ensure current location is available or click map to select origin');
      return;
    }

    if (!targetPoi) {
      alert('Cannot get target location');
      return;
    }

    // 开始导航规划时自动关闭POI详情卡片，让用户能看到路线信息 - Auto close POI card when starting navigation to show route info
    setSelectedPoi(null);

    console.log('开始路线规划:', { 
      from: originLocation, 
      fromName: originName,
      to: targetPoi.location, 
      toName: targetPoi.name,
      mode: mode,
      isFromClickedLocation: !!clickedLocation
    });

    // 清除之前的路线和状态 - Clear previous route and states
    map.clearMap();
    setShowRoute(false);
    setRouteInfo(null);
    setCurrentRoutePoi(null);

    // 重新添加POI标记 - Re-add POI markers
    pois.forEach((poi, index) => {
      const marker = new window.AMap.Marker({
        position: poi.location,
        title: poi.name,
        label: {
          content: `${index + 1}`,
          direction: 'center'
        }
      });

      marker.on('click', () => {
        setSelectedPoi(poi);
        map.setCenter(poi.location);
        map.setZoom(15);
      });

      map.add(marker);
    });

    // 根据不同出行方式构建API URL - Build API URL based on different transportation modes
    const apiKey = '266526b3ebb2bad7b327c4fd98595027';
    const origin = `${originLocation[0]},${originLocation[1]}`;
    const destination = `${targetPoi.location[0]},${targetPoi.location[1]}`;
    
    let routeUrl = '';
    let routeParams = `origin=${origin}&destination=${destination}&key=${apiKey}&show_fields=cost,navi,polyline,steps`;
    
    switch (mode) {
      case 'driving':
        routeUrl = `https://restapi.amap.com/v5/direction/driving?${routeParams}&strategy=32&alternative_route=0`;
        break;
      case 'walking':
        routeUrl = `https://restapi.amap.com/v5/direction/walking?${routeParams}&alternative_route=0`;
        break;
      case 'bicycling':
        routeUrl = `https://restapi.amap.com/v5/direction/bicycling?${routeParams}&alternative_route=0`;
        break;
      case 'electrobike':
        routeUrl = `https://restapi.amap.com/v5/direction/electrobike?${routeParams}&alternative_route=0`;
        break;
      default:
        routeUrl = `https://restapi.amap.com/v5/direction/driving?${routeParams}&strategy=32&alternative_route=0`;
    }

    try {
      console.log('调用路径规划2.0 API...', mode);
      console.log('请求URL:', routeUrl);
      const response = await fetch(routeUrl);
      const result = await response.json();
      
      console.log('路径规划2.0完整结果:', JSON.stringify(result, null, 2));
      
      if (result.status === '1' && result.route && result.route.paths && result.route.paths.length > 0) {
        const route = result.route.paths[0];
        console.log('选中的路径详情:', JSON.stringify(route, null, 2));
        
        // 根据不同模式设置路线信息 - Set route information based on different modes
        const routeData = {
          distance: (route.distance / 1000).toFixed(2) + ' km',
          time: route.cost ? Math.round(route.cost.duration / 60) + ' 分钟' : '未知',
          mode: getModeLabel(mode),
          steps: route.steps || [],
          origin: {
            name: originName,
            location: originLocation,
            isFromClick: !!clickedLocation
          },
          destination: {
            name: targetPoi.name,
            location: targetPoi.location
          }
        };

        // 驾车模式特有信息 - Driving mode specific information
        if (mode === 'driving') {
          routeData.tolls = route.cost && route.cost.tolls ? '¥' + route.cost.tolls : '无过路费';
          routeData.trafficLights = route.cost && route.cost.traffic_lights ? route.cost.traffic_lights + ' 个红绿灯' : '';
        }

        setRouteInfo(routeData);
        
        // 路线规划成功后设置相关状态 - Set related states after successful route planning
        setShowRoute(true);
        setCurrentRoutePoi(targetPoi);
        console.log('路线规划成功，设置当前导航目标POI:', targetPoi);

        // 在地图上绘制路线 - Draw route on map
        if (route.polyline) {
          console.log('原始polyline数据:', route.polyline);
          
          const polylineData = route.polyline.split(';').map(point => {
            const [lng, lat] = point.split(',');
            const coordinates = [parseFloat(lng), parseFloat(lat)];
            console.log('转换后的坐标点:', coordinates);
            return coordinates;
          });

          console.log('完整路径数据:', polylineData);

          // 根据出行模式设置不同颜色 - Set different colors based on transportation mode
          const colors = {
            driving: '#3366FF',
            walking: '#00AA00', 
            bicycling: '#FF6600',
            electrobike: '#9900FF'
          };

          const polyline = new window.AMap.Polyline({
            path: polylineData,
            strokeColor: colors[mode] || '#3366FF',
            strokeWeight: 6,
            strokeOpacity: 0.8,
            strokeStyle: 'solid'
          });

          console.log('创建的polyline对象:', polyline);
          map.add(polyline);
          console.log('polyline已添加到地图');
        } else if (route.steps && route.steps.length > 0) {
          console.log('没有polyline数据，尝试使用steps数据绘制路径');
          
          // 使用steps数据构建路径 - Build path using steps data
          let pathPoints = [];
          route.steps.forEach(step => {
            if (step.polyline) {
              const stepPoints = step.polyline.split(';').map(point => {
                const [lng, lat] = point.split(',');
                return [parseFloat(lng), parseFloat(lat)];
              });
              pathPoints = pathPoints.concat(stepPoints);
            }
          });

          if (pathPoints.length > 0) {
            console.log('使用steps构建的路径点:', pathPoints);
            const colors = {
              driving: '#3366FF',
              walking: '#00AA00', 
              bicycling: '#FF6600',
              electrobike: '#9900FF'
            };

            const polyline = new window.AMap.Polyline({
              path: pathPoints,
              strokeColor: colors[mode] || '#3366FF',
              strokeWeight: 6,
              strokeOpacity: 0.8,
              strokeStyle: 'solid'
            });

            map.add(polyline);
            console.log('使用steps数据成功绘制路径');
          } else {
            console.log('steps中也没有有效的路径数据');
          }
        } else {
          console.log('没有polyline和steps数据，无法绘制路径');
        }

        // 添加起点和终点标记 - Add origin and destination markers
        const startMarker = new window.AMap.Marker({
          position: originLocation,
          title: originName,
          icon: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png'
        });

        const endMarker = new window.AMap.Marker({
          position: targetPoi.location,
          title: 'Destination',
          icon: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png'
        });

        map.add([startMarker, endMarker]);
        map.setFitView();

      } else {
        console.log('路线规划失败:', result.info);
        alert('Route planning failed: ' + (result.info || 'Unknown error'));
      }

    } catch (error) {
      console.error('路线规划API调用失败:', error);
      alert('Route planning failed, please check network connection: ' + error.message);
    }
  };

  // 获取出行模式标签 - Get transportation mode label
  const getModeLabel = (mode) => {
    const labels = {
      driving: '🚗 驾车',
      walking: '🚶 步行',
      bicycling: '🚴 骑行',
      electrobike: '🛵 电动车'
    };
    return labels[mode] || '🚗 驾车';
  };

  // 跳转到高德地图导航 - Jump to AMap navigation
  const openAmapNavigation = (targetPoi) => {
    // 判断起点来源：优先使用点击位置，其次使用用户当前位置 - Determine origin: prioritize clicked location, then user location
    let navigationOrigin = null;
    let originName = '';
    
    if (clickedLocation) {
      // 使用点击位置作为起点 - Use clicked location as origin
      navigationOrigin = clickedLocation;
      originName = '选择位置 / Selected Location';
    } else if (userLocation) {
      // 使用用户当前位置作为起点 - Use user location as origin
      navigationOrigin = userLocation;
      originName = '我的位置 / My Location';
    } else {
      alert('Cannot get origin location');
      return;
    }

    if (!targetPoi) {
      alert('无法获取目标位置 / Cannot get target location');
      return;
    }

    // 构建高德地图导航URL - Build AMap navigation URL
    // 格式 Format: https://uri.amap.com/navigation?from=起点经度,起点纬度,起点名称&to=终点经度,终点纬度,终点名称&mode=出行方式&coordinate=gcj02
    const fromCoord = `${navigationOrigin[0]},${navigationOrigin[1]}`;
    const toCoord = `${targetPoi.location[0]},${targetPoi.location[1]}`;
    const fromName = encodeURIComponent(originName);
    const toName = encodeURIComponent(targetPoi.name);
    
    // 将routeMode转换为高德地图的模式参数 - Convert routeMode to AMap mode parameters
    const modeMapping = {
      'driving': 'car',     // 驾车 - Driving
      'walking': 'walk',    // 步行 - Walking
      'bicycling': 'bike',  // 骑行 - Bicycling
      'electrobike': 'bike' // 电动车用骑行模式 - Electric bike uses bicycling mode
    };
    
    const amapMode = modeMapping[routeMode] || 'car';
    
    // 构建完整的导航URL - Build complete navigation URL
    const navigationUrl = `https://uri.amap.com/navigation?from=${fromCoord},${fromName}&to=${toCoord},${toName}&mode=${amapMode}&coordinate=gcj02&callnative=1`;
    
    console.log('打开高德地图导航:', navigationUrl);
    
    // 在新窗口打开高德地图导航 - Open AMap navigation in new window
    window.open(navigationUrl, '_blank');
  };

  // 关闭POI详情卡片 - Close POI detail card
  const closePOICard = () => {
    setSelectedPoi(null);
    // 只有在没有进行导航规划时才清除路线信息
    // 如果有路线信息，保留它让用户可以使用跳转按钮
  };

  // 清除路线信息
  const clearRoute = () => {
    setRouteInfo(null);
    setShowRoute(false);
    setCurrentRoutePoi(null);
    map.clearMap();
    // 重新添加POI标记
    pois.forEach((poi, index) => {
      const marker = new window.AMap.Marker({
        position: poi.location,
        title: poi.name,
        label: {
          content: `${index + 1}`,
          direction: 'center'
        }
      });

      marker.on('click', () => {
        setSelectedPoi(poi);
        map.setCenter(poi.location);
        map.setZoom(15);
      });

      map.add(marker);
    });
  };

  // 测试路径绘制功能
  const testRouteDrawing = () => {
    console.log('测试路径绘制功能');
    
    // 清除地图
    map.clearMap();
    
    // 创建一个简单的测试路径（北京市内的几个点）
    const testPath = [
      [116.397428, 39.90923],   // 北京天安门
      [116.405285, 39.904989],  // 王府井
      [116.418757, 39.917544],  // 三里屯
      [116.432717, 39.922501]   // 朝阳公园
    ];

    // 绘制测试路径
    const testPolyline = new window.AMap.Polyline({
      path: testPath,
      strokeColor: '#FF0000',
      strokeWeight: 8,
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    });

    map.add(testPolyline);

    // 添加起点和终点标记
    const startMarker = new window.AMap.Marker({
      position: testPath[0],
      title: '测试起点',
      icon: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png'
    });

    const endMarker = new window.AMap.Marker({
      position: testPath[testPath.length - 1],
      title: '测试终点',
      icon: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png'
    });

    map.add([startMarker, endMarker]);
    map.setFitView();

    console.log('测试路径已绘制');
    alert('测试路径已绘制，如果您能看到红色路径，说明路径绘制功能正常');
  };

  // 基于点击位置搜索POI - Search POI based on clicked location
  const searchPOIAtLocation = async () => {
    if (!map || !locationSearchKeyword.trim() || !clickedLocation) {
      alert('请输入搜索关键词 / Please enter search keyword');
      return;
    }

    console.log('开始在指定位置搜索POI:', locationSearchKeyword, '位置:', clickedLocation);

    // 清除之前的搜索结果 - Clear previous search results
    map.clearMap();
    setPois([]);
    setSelectedPoi(null);
    setRouteInfo(null);
    setShowRoute(false);

    const apiKey = '266526b3ebb2bad7b327c4fd98595027';
    const location = `${clickedLocation[0]},${clickedLocation[1]}`;
    const searchUrl = `https://restapi.amap.com/v3/place/around?location=${location}&keywords=${encodeURIComponent(locationSearchKeyword)}&radius=5000&key=${apiKey}&offset=20&page=1&extensions=all&lang=en`;

    try {
      console.log('调用位置周边搜索API...');
      const response = await fetch(searchUrl);
      const result = await response.json();
      
      console.log('位置周边搜索API响应:', result);

      if (result.status === '1' && result.pois && result.pois.length > 0) {
        // 处理POI数据 - Process POI data
        const poiData = result.pois.map(poi => ({
          id: poi.id,
          name: poi.name,
          address: poi.address,
          location: poi.location ? poi.location.split(',').map(Number) : [0, 0],
          type: poi.type || '未知类型',
          tel: poi.tel || '暂无电话',
          distance: poi.distance,
          typecode: poi.typecode
        }));
        
        console.log('处理后的POI数据:', poiData);
        setPois(poiData);

        // 在地图上添加点击位置标记 - Add clicked location marker
        const clickMarker = new window.AMap.Marker({
          position: clickedLocation,
          title: '搜索起点 / Search Origin',
          icon: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png'
        });
        map.add(clickMarker);

        // 在地图上添加POI标记 - Add POI markers on map
        poiData.forEach((poi, index) => {
          if (poi.location[0] !== 0 && poi.location[1] !== 0) {
            const marker = new window.AMap.Marker({
              position: poi.location,
              title: poi.name,
              label: {
                content: `${index + 1}`,
                direction: 'center'
              }
            });

            marker.on('click', () => {
              setSelectedPoi(poi);
              map.setCenter(poi.location);
              map.setZoom(15);
            });

            map.add(marker);
          }
        });

        // 调整地图视野以显示所有POI和点击位置 - Adjust map view to show all POIs and clicked location
        map.setFitView();
        
        // 关闭搜索窗口 - Close search window
        setShowLocationSearch(false);
      } else {
        alert(result.info || '未找到相关结果，请尝试其他关键词 / No results found, please try other keywords');
      }
    } catch (error) {
      console.error('位置搜索API调用失败:', error);
      alert('搜索失败，请检查网络连接 / Search failed, please check network connection');
    }
  };

  // 关闭位置搜索窗口 - Close location search window
  const closeLocationSearch = () => {
    setShowLocationSearch(false);
    setLocationSearchKeyword('');
    setClickedLocation(null);
  };

  // 获取点击位置的详细信息 - Get detailed info of clicked location
  const getLocationInfo = async (lng, lat) => {
    const apiKey = '266526b3ebb2bad7b327c4fd98595027';
    const location = `${lng},${lat}`;
    
    try {
      console.log('开始获取位置信息:', { lng, lat });
      
      // 使用高德地图逆地理编码API获取地址信息 - Use AMap reverse geocoding API to get address info
      const geocodeUrl = `https://restapi.amap.com/v3/geocode/regeo?location=${location}&key=${apiKey}&radius=1000&extensions=all&lang=zh`;
      
      const response = await fetch(geocodeUrl);
      const result = await response.json();
      
      console.log('逆地理编码结果:', result);
      
      if (result.status === '1' && result.regeocode) {
        const regeocode = result.regeocode;
        const addressComponent = regeocode.addressComponent;
        
        // 构建位置信息对象 - Build location info object
        const locationInfo = {
          coordinate: { lng, lat },
          formattedAddress: regeocode.formatted_address || '未知地址',
          country: addressComponent.country || '中国',
          province: addressComponent.province || '未知省份',
          city: addressComponent.city || '未知城市',
          district: addressComponent.district || '未知区域',
          township: addressComponent.township || '',
          neighborhood: addressComponent.neighborhood?.name || '',
          building: addressComponent.building?.name || '',
          adcode: addressComponent.adcode || '',
          citycode: addressComponent.citycode || '',
          // 附近POI信息
          pois: regeocode.pois?.slice(0, 5) || [], // 取前5个最近的POI
          // 道路信息
          roads: regeocode.roads?.slice(0, 3) || [], // 取前3条最近的道路
          // 地标信息
          landmarks: regeocode.roadinters?.slice(0, 3) || [] // 取前3个路口信息
        };
        
        console.log('处理后的位置信息:', locationInfo);
        setClickedLocationInfo(locationInfo);
        setShowLocationInfo(true);
        
      } else {
        console.error('逆地理编码失败:', result);
        // 如果逆地理编码失败，显示基本的坐标信息
        const basicInfo = {
          coordinate: { lng, lat },
          formattedAddress: `经度: ${lng.toFixed(6)}, 纬度: ${lat.toFixed(6)}`,
          country: '未知',
          province: '未知',
          city: '未知',
          district: '未知',
          pois: [],
          roads: [],
          landmarks: []
        };
        setClickedLocationInfo(basicInfo);
        setShowLocationInfo(true);
      }
    } catch (error) {
      console.error('获取位置信息失败:', error);
      // 显示基本信息
      const basicInfo = {
        coordinate: { lng, lat },
        formattedAddress: `经度: ${lng.toFixed(6)}, 纬度: ${lat.toFixed(6)}`,
        country: '未知',
        province: '未知', 
        city: '未知',
        district: '未知',
        pois: [],
        roads: [],
        landmarks: []
      };
      setClickedLocationInfo(basicInfo);
      setShowLocationInfo(true);
    }
  };

  // 关闭位置信息卡片 - Close location info card
  const closeLocationInfo = () => {
    setShowLocationInfo(false);
    setClickedLocationInfo(null);
  };

  // 从位置信息卡片打开搜索窗口 - Open search window from location info card
  const openSearchFromLocationInfo = () => {
    setShowLocationInfo(false);
    setShowLocationSearch(true);
    setLocationSearchKeyword('');
  };

  return (
    <div className="App">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search POI..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchPOI()}
          className="search-input"
        />
        <button onClick={searchPOI} className="search-button">Nationwide Search</button>
        <button 
          onClick={searchNearby} 
          className="nearby-button" 
          style={{marginLeft: '5px', padding: '10px', background: '#52c41a', color: 'white', border: 'none', borderRadius: '4px'}}
          disabled={!userLocation}
        >
          Nearby Search
        </button>
        <button onClick={testAPI} className="test-button" style={{marginLeft: '10px', padding: '10px', background: '#52c41a', color: 'white', border: 'none', borderRadius: '4px'}}>Test API</button>
        <button onClick={testAPIKeyWithRest} className="test-rest-button" style={{marginLeft: '5px', padding: '10px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '4px'}}>Test Key</button>
        <button onClick={testRouteDrawing} className="test-route-button" style={{marginLeft: '5px', padding: '10px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px'}}>Test Route</button>
        
        {/* 点击位置状态显示和清除按钮 - Clicked location status and clear button */}
        {clickedLocation && (
          <button 
            onClick={() => {
              setClickedLocation(null);
              setShowLocationSearch(false);
            }} 
            className="clear-location-button" 
            style={{
              marginLeft: '5px', 
              padding: '8px 12px', 
              background: '#faad14', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontSize: '12px'
            }}
            title="Clear selected origin location"
          >
            📍 Clear Origin
          </button>
        )}
      </div>

      {/* 出行方式选择 - Transportation mode selector */}
      <div className="route-mode-selector">
        <span>Transportation Mode:</span>
        <button 
          className={routeMode === 'driving' ? 'active' : ''} 
          onClick={() => setRouteMode('driving')}
          title="Driving"
        >
          🚗 Driving
        </button>
        <button 
          className={routeMode === 'walking' ? 'active' : ''} 
          onClick={() => setRouteMode('walking')}
          title="Walking"
        >
          🚶 Walking
        </button>
        <button 
          className={routeMode === 'bicycling' ? 'active' : ''} 
          onClick={() => setRouteMode('bicycling')}
          title="Bicycling"
        >
          🚴 Bicycling
        </button>
        <button 
          className={routeMode === 'electrobike' ? 'active' : ''} 
          onClick={() => setRouteMode('electrobike')}
          title="E-bike"
        >
          🛵 E-bike
        </button>
      </div>

      <div className="main-container">
        <div className="map-container">
          <div id="mapContainer" ref={mapRef}></div>
        </div>

        <div className="sidebar">
          <div className="poi-list">
            <h3>Search Results</h3>
            {pois.length === 0 ? (
              <p className="no-results">No search results</p>
            ) : (
              <div className="poi-items">
                {pois.map((poi, index) => (
                  <div
                    key={poi.id}
                    className={`poi-item ${selectedPoi?.id === poi.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPoi(poi);
                      map.setCenter(poi.location);
                      map.setZoom(15);
                    }}
                  >
                    <div className="poi-number">{index + 1}</div>
                    <div className="poi-info">
                      <h4>{poi.name}</h4>
                      <p>{poi.address}</p>
                      <span className="poi-type">{poi.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showRoute && routeInfo && (
            <div className="route-info">
              <h3>Route Information</h3>
              <div className="route-details">
                {/* 起点和终点信息 - Origin and destination info */}
                {routeInfo.origin && (
                  <div className="route-points">
                    <p><strong>Origin:</strong> {routeInfo.origin.name}</p>
                    {routeInfo.origin.isFromClick && (
                      <span className="origin-source">📍 Map clicked location</span>
                    )}
                  </div>
                )}
                {routeInfo.destination && (
                  <p><strong>Destination:</strong> {routeInfo.destination.name}</p>
                )}
                
                <hr style={{margin: '10px 0', border: '1px solid #eee'}} />
                
                <p><strong>Mode:</strong> {routeInfo.mode}</p>
                <p><strong>Distance:</strong> {routeInfo.distance}</p>
                <p><strong>Time:</strong> {routeInfo.time}</p>
                {routeInfo.tolls && <p><strong>Tolls:</strong> {routeInfo.tolls}</p>}
                {routeInfo.trafficLights && <p><strong>Traffic Lights:</strong> {routeInfo.trafficLights}</p>}
              </div>
              
              {/* 高德地图导航按钮和操作 - AMap navigation buttons and actions */}
              <div className="navigation-actions">
                {currentRoutePoi && (
                  <button 
                    onClick={() => openAmapNavigation(currentRoutePoi)}
                    className="amap-navigation-btn"
                  >
                    🧭 Navigate in AMap
                  </button>
                )}
                
                <button 
                  onClick={clearRoute}
                  className="clear-route-btn"
                  style={{
                    background: '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    width: '100%'
                  }}
                >
                  Clear Route
                </button>
              </div>
              
              <div id="routePanel" className="route-panel"></div>
            </div>
          )}
        </div>
      </div>

      {/* 位置信息卡片 - Location info card */}
      {showLocationInfo && clickedLocationInfo && (
        <div className="poi-card-overlay">
          <div className="location-info-card">
            <div className="location-info-header">
              <h3>📍 Location Information</h3>
              <button onClick={closeLocationInfo} className="close-button">×</button>
            </div>
            <div className="location-info-content">
              {/* 基本地址信息 - Basic address info */}
              <div className="address-section">
                <h4>🏠 Address</h4>
                <p className="formatted-address">{clickedLocationInfo.formattedAddress}</p>
                
                <div className="address-details">
                  <div className="address-row">
                    <span className="label">Country:</span>
                    <span className="value">{clickedLocationInfo.country}</span>
                  </div>
                  <div className="address-row">
                    <span className="label">Province:</span>
                    <span className="value">{clickedLocationInfo.province}</span>
                  </div>
                  <div className="address-row">
                    <span className="label">City:</span>
                    <span className="value">{clickedLocationInfo.city}</span>
                  </div>
                  <div className="address-row">
                    <span className="label">District:</span>
                    <span className="value">{clickedLocationInfo.district}</span>
                  </div>
                  {clickedLocationInfo.township && (
                    <div className="address-row">
                      <span className="label">Township:</span>
                      <span className="value">{clickedLocationInfo.township}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 坐标信息 - Coordinate info */}
              <div className="coordinate-section">
                <h4>🌐 Coordinates</h4>
                <div className="coordinate-details">
                  <div className="coordinate-row">
                    <span className="label">Longitude:</span>
                    <span className="value">{clickedLocationInfo.coordinate.lng.toFixed(6)}</span>
                  </div>
                  <div className="coordinate-row">
                    <span className="label">Latitude:</span>
                    <span className="value">{clickedLocationInfo.coordinate.lat.toFixed(6)}</span>
                  </div>
                  {clickedLocationInfo.adcode && (
                    <div className="coordinate-row">
                      <span className="label">Adcode:</span>
                      <span className="value">{clickedLocationInfo.adcode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 附近POI信息 - Nearby POI info */}
              {clickedLocationInfo.pois && clickedLocationInfo.pois.length > 0 && (
                <div className="nearby-section">
                  <h4>🏢 Nearby POIs</h4>
                  <div className="nearby-pois">
                    {clickedLocationInfo.pois.slice(0, 3).map((poi, index) => (
                      <div key={index} className="nearby-poi-item">
                        <span className="poi-name">{poi.name}</span>
                        <span className="poi-distance">{poi.distance}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 道路信息 - Road info */}
              {clickedLocationInfo.roads && clickedLocationInfo.roads.length > 0 && (
                <div className="road-section">
                  <h4>🛣️ Nearby Roads</h4>
                  <div className="nearby-roads">
                    {clickedLocationInfo.roads.slice(0, 2).map((road, index) => (
                      <div key={index} className="road-item">
                        <span className="road-name">{road.name}</span>
                        <span className="road-distance">{road.distance}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 操作按钮 - Action buttons */}
              <div className="location-actions">
                <button 
                  onClick={openSearchFromLocationInfo}
                  className="search-here-button"
                >
                  🔍 Search POI Here
                </button>
                <button 
                  onClick={() => {
                    if (clickedLocationInfo && clickedLocationInfo.coordinate) {
                      navigator.clipboard.writeText(
                        `${clickedLocationInfo.coordinate.lng.toFixed(6)}, ${clickedLocationInfo.coordinate.lat.toFixed(6)}`
                      );
                      alert('Coordinates copied to clipboard');
                    }
                  }}
                  className="copy-coords-button"
                >
                  📋 Copy Coordinates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 位置搜索弹窗 - Location search popup */}
      {showLocationSearch && clickedLocation && (
        <div className="poi-card-overlay">
          <div className="location-search-card">
            <div className="location-search-header">
              <h3>Search POI at this location</h3>
              <button onClick={closeLocationSearch} className="close-button">×</button>
            </div>
            <div className="location-search-content">
              <p className="location-info">
                <strong>Selected Location:</strong><br/>
                Longitude: {clickedLocation[0].toFixed(6)}<br/>
                Latitude: {clickedLocation[1].toFixed(6)}
              </p>
              <div className="location-search-input-group">
                <input
                  type="text"
                  placeholder="Enter keywords like: restaurant, bank, gas station..."
                  value={locationSearchKeyword}
                  onChange={(e) => setLocationSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPOIAtLocation()}
                  className="location-search-input"
                />
                <button onClick={searchPOIAtLocation} className="location-search-button">
                  Search Nearby POI
                </button>
              </div>
              <p className="search-tip">
                💡 Tip: Will search POI within 5km radius from clicked location
              </p>
            </div>
          </div>
        </div>
      )}

      {/* POI详情卡片 - POI detail card */}
      {selectedPoi && (
        <div className="poi-card-overlay">
          <div className="poi-card">
            <div className="poi-card-header">
              <h3>{selectedPoi.name}</h3>
              <button onClick={closePOICard} className="close-button">×</button>
            </div>
            <div className="poi-card-content">
              <p><strong>地址:</strong> {selectedPoi.address}</p>
              <p><strong>类型:</strong> {selectedPoi.type}</p>
              <p><strong>电话:</strong> {selectedPoi.tel}</p>
              {selectedPoi.distance && (
                <p><strong>距离:</strong> {(selectedPoi.distance / 1000).toFixed(2)} km</p>
              )}
            </div>
            <div className="poi-card-actions">
              <button
                onClick={() => showNavigation(selectedPoi)}
                className="navigation-button"
              >
                🧭 导航
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
