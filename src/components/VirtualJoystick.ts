import Phaser from 'phaser'

export class VirtualJoystick {
  private scene: Phaser.Scene
  private base: Phaser.GameObjects.Image
  private stick: Phaser.GameObjects.Image
  private isDragging: boolean = false
  private baseRadius: number = 40
  private stickRadius: number = 15
  private maxDistance: number = 35
  private direction: { x: number; y: number } = { x: 0, y: 0 }
  private isVisible: boolean = false

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    this.scene = scene
    
    // 创建摇杆底座，初始隐藏
    this.base = scene.add.image(x, y, 'joystick-base')
    this.base.setAlpha(0)
    this.base.setDepth(100)
    this.base.setVisible(false)
    
    // 创建摇杆手柄，初始隐藏
    this.stick = scene.add.image(x, y, 'joystick-stick')
    this.stick.setDepth(101)
    this.stick.setVisible(false)
    
    // 设置交互
    this.setupInteraction()
  }

  private setupInteraction() {
    // 监听全屏触摸事件
    this.scene.input.on('pointerdown', this.onPointerDown, this)
    this.scene.input.on('pointermove', this.onPointerMove, this)
    this.scene.input.on('pointerup', this.onPointerUp, this)
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (!this.isVisible) {
      // 摇杆未显示时，在触摸位置显示摇杆
      this.showJoystick(pointer.x, pointer.y)
      this.isDragging = true
    } else {
      // 摇杆已显示时，检查是否在摇杆区域内
      const baseX = this.base.x
      const baseY = this.base.y
      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, baseX, baseY)
      
      if (distance <= this.baseRadius + 20) {
        this.isDragging = true
      } else {
        // 在新位置重新显示摇杆
        this.hideJoystick()
        setTimeout(() => {
          this.showJoystick(pointer.x, pointer.y)
          this.isDragging = true
        }, 50)
      }
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isDragging) return

    const baseX = this.base.x
    const baseY = this.base.y
    
    // 计算从底座中心到触摸点的向量
    let deltaX = pointer.x - baseX
    let deltaY = pointer.y - baseY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance > this.maxDistance) {
      // 限制手柄在最大距离内
      deltaX = (deltaX / distance) * this.maxDistance
      deltaY = (deltaY / distance) * this.maxDistance
    }
    
    // 更新手柄位置
    this.stick.setPosition(baseX + deltaX, baseY + deltaY)
    
    // 计算方向向量（归一化）
    if (distance > 5) { // 设置死区，避免微小的抖动
      this.direction.x = deltaX / this.maxDistance
      this.direction.y = deltaY / this.maxDistance
    } else {
      this.direction.x = 0
      this.direction.y = 0
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    if (!this.isDragging) return
    
    this.isDragging = false
    
    // 隐藏摇杆
    this.hideJoystick()
    
    // 重置方向
    this.direction.x = 0
    this.direction.y = 0
  }

  private showJoystick(x: number, y: number) {
    this.base.setPosition(x, y)
    this.stick.setPosition(x, y)
    this.base.setVisible(false)
    this.stick.setVisible(false)
    this.base.setAlpha(0)
    this.stick.setAlpha(0)
    this.isVisible = true
  }

  private hideJoystick() {
    this.scene.tweens.add({
      targets: [this.base, this.stick],
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        this.base.setVisible(false)
        this.stick.setVisible(false)
        this.isVisible = false
      }
    })
  }

  getDirection(): { x: number; y: number } {
    return { x: this.direction.x, y: this.direction.y }
  }

  setPosition(x: number, y: number) {
    this.base.setPosition(x, y)
    if (!this.isDragging) {
      this.stick.setPosition(x, y)
    }
  }

  setVisible(visible: boolean) {
    this.base.setVisible(visible)
    this.stick.setVisible(visible)
  }

  destroy() {
    this.base.destroy()
    this.stick.destroy()
  }
}