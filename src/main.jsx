/**
 * @file 应用入口
 * @description 创建 React 根节点并注入园区数据仓储。
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import { mockCampusRepository } from './infrastructure/repositories/mockCampusRepository.js';
import './styles/index.css';

createRoot(document.getElementById('root')).render(<App repository={mockCampusRepository} />);
