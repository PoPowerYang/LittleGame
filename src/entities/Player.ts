import Phaser from 'phaser'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 120
  private isMoving: boolean = false
  private lastDirection: string = 'front'

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-idle-front')
    
    scene.physics.add.existing(this)
    this.setCollideWorldBounds(true)
    
    // 设置碰撞体积适配64x64精灵，更符合像素游戏风格
    this.body!.setSize(40, 50, true)
    this.body!.setOffset(12, 14)
    
    // 优化显示效果
    this.setScale(1)
    this.setOrigin(0.5, 0.5)
    
    this.createAnimations()
  }

  private createAnimations() {
    // 创建方向性行走动画
    
    // 向下行走动画 (正面)
    if (!this.scene.anims.exists('player-walk-down')) {
      this.scene.anims.create({
        key: 'player-walk-down',
        frames: [
          { key: 'player-walk-front1', frame: 0 },
          { key: 'player-walk-front2', frame: 0 },
          { key: 'player-walk-front3', frame: 0 },
          { key: 'player-walk-front2', frame: 0 },
        ],
        frameRate: 8,
        repeat: -1
      })
    }

    // 向上行走动画 (背面)
    if (!this.scene.anims.exists('player-walk-up')) {
      this.scene.anims.create({
        key: 'player-walk-up',
        frames: [
          { key: 'player-walk-back1', frame: 0 },
          { key: 'player-walk-back2', frame: 0 },
          { key: 'player-walk-back3', frame: 0 },
          { key: 'player-walk-back2', frame: 0 },
        ],
        frameRate: 8,
        repeat: -1
      })
    }

    // 向左行走动画
    if (!this.scene.anims.exists('player-walk-left')) {
      this.scene.anims.create({
        key: 'player-walk-left',
        frames: [
          { key: 'player-walk-left1', frame: 0 },
          { key: 'player-walk-left2', frame: 0 },
          { key: 'player-walk-left3', frame: 0 },
          { key: 'player-walk-left2', frame: 0 },
        ],
        frameRate: 8,
        repeat: -1
      })
    }

    // 向右行走动画
    if (!this.scene.anims.exists('player-walk-right')) {
      this.scene.anims.create({
        key: 'player-walk-right',
        frames: [
          { key: 'player-walk-right1', frame: 0 },
          { key: 'player-walk-right2', frame: 0 },
          { key: 'player-walk-right3', frame: 0 },
          { key: 'player-walk-right2', frame: 0 },
        ],
        frameRate: 8,
        repeat: -1
      })
    }

    // 待机动画 - 各个方向
    if (!this.scene.anims.exists('player-idle-front')) {
      this.scene.anims.create({
        key: 'player-idle-front',
        frames: [{ key: 'player-idle-front', frame: 0 }],
        frameRate: 1,
        repeat: 0
      })
    }

    if (!this.scene.anims.exists('player-idle-back')) {
      this.scene.anims.create({
        key: 'player-idle-back',
        frames: [{ key: 'player-idle-back', frame: 0 }],
        frameRate: 1,
        repeat: 0
      })
    }

    if (!this.scene.anims.exists('player-idle-left')) {
      this.scene.anims.create({
        key: 'player-idle-left',
        frames: [{ key: 'player-idle-left', frame: 0 }],
        frameRate: 1,
        repeat: 0
      })
    }

    if (!this.scene.anims.exists('player-idle-right')) {
      this.scene.anims.create({
        key: 'player-idle-right',
        frames: [{ key: 'player-idle-right', frame: 0 }],
        frameRate: 1,
        repeat: 0
      })
    }
  }

  update(direction: { x: number; y: number }) {
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // 重置速度
    body.setVelocity(0)
    
    this.isMoving = false

    // 处理移动输入
    if (direction.x !== 0 || direction.y !== 0) {
      this.isMoving = true
      
      // 规范化向量以确保对角线移动速度一致
      const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
      if (length > 0) {
        const normalizedX = (direction.x / length) * this.speed
        const normalizedY = (direction.y / length) * this.speed
        
        body.setVelocity(normalizedX, normalizedY)
      }
      
      // 根据移动方向播放相应动画
      this.playMovementAnimation(direction)
    } else {
      // 停止时播放相应方向的待机动画
      if (this.lastDirection === 'right') {
        this.play('player-idle-left', true)
        this.setFlipX(true)
      } else if (this.lastDirection === 'left') {
        this.play('player-idle-left', true)
        this.setFlipX(false)
      } else {
        this.play(`player-idle-${this.lastDirection}`, true)
        this.setFlipX(false)
      }
    }
  }

  private playMovementAnimation(direction: { x: number; y: number }) {
    // 确定主要移动方向
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
      // 水平移动为主
      if (direction.x > 0) {
        // 向右移动 - 使用左侧动画但镜像
        this.play('player-walk-left', true)
        this.lastDirection = 'right'
        this.setFlipX(true)
      } else {
        // 向左移动 - 使用左侧动画不镜像
        this.play('player-walk-left', true)
        this.lastDirection = 'left'
        this.setFlipX(false)
      }
    } else {
      // 垂直移动为主
      if (direction.y > 0) {
        this.play('player-walk-down', true)
        this.lastDirection = 'front'
        this.setFlipX(false)
      } else {
        this.play('player-walk-up', true)
        this.lastDirection = 'back'
        this.setFlipX(false)
      }
    }
  }

  getIsMoving(): boolean {
    return this.isMoving
  }
}