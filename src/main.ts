import Phaser from 'phaser'
import { MainScene } from './scenes/MainScene'
import { MobileUtils } from './utils/MobileUtils'

// 初始化移动端设置
MobileUtils.initMobile()

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 414,
  height: 736,
  parent: 'game-container',
  backgroundColor: '#2c3e50',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
    width: 414,
    height: 736
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  render: {
    pixelArt: true,
    antialias: false
  },
  scene: [MainScene]
}

const game = new Phaser.Game(config)

export default game