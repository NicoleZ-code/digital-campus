import React from 'react';

export default function AppFooter({ level }) {
  return (
    <footer>
      <span>
        空间资产 <b>/ 0{level + 1} / 05</b>
      </span>
      <span>所有楼宇与资产均为程序化演示模型 · 上海地图为示意</span>
      <span>
        <i /> SYSTEM ONLINE <b>HAIXU © 2026</b>
      </span>
    </footer>
  );
}
