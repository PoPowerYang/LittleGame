export class MobileUtils {
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  static isPortrait(): boolean {
    return window.innerHeight > window.innerWidth
  }

  static preventZoom(): void {
    // 阻止双击缩放
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }, { passive: false })

    let lastTouchEnd = 0
    document.addEventListener('touchend', (e) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }, { passive: false })
  }

  static lockOrientation(): void {
    // 尝试锁定为竖屏方向
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait-primary').catch((err) => {
        console.warn('无法锁定屏幕方向:', err)
      })
    }
  }

  static setupViewport(): void {
    // 设置视口元标签确保正确的缩放
    const viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
    }
  }

  static addMobileStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        position: fixed;
        width: 100%;
        height: 100%;
        background: #000;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      canvas {
        touch-action: none;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      #game-container {
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      @media screen and (orientation: landscape) {
        body::before {
          content: "请将设备旋转为竖屏模式以获得最佳游戏体验";
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 18px;
          text-align: center;
          z-index: 9999;
          background: rgba(0,0,0,0.8);
          padding: 20px;
          border-radius: 10px;
        }
        
        #game-container {
          filter: blur(5px);
        }
      }
    `
    document.head.appendChild(style)
  }

  static initMobile(): void {
    if (this.isMobile()) {
      this.setupViewport()
      this.preventZoom()
      this.addMobileStyles()
      this.lockOrientation()
    }
  }
}