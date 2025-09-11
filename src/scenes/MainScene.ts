import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { VirtualJoystick } from '../components/VirtualJoystick'

export class MainScene extends Phaser.Scene {
  private player!: Player
  private joystick!: VirtualJoystick
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private houses!: Phaser.Physics.Arcade.StaticGroup

  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    this.createPlayerSprite()
    this.createJoystickGraphics()
    this.createHouseSprites()
  }

  create() {
    this.setupWorld()
    this.createPlayer()
    this.createHouses()
    this.createJoystick()
    this.setupInput()
  }

  update() {
    if (this.player && this.joystick) {
      this.player.update(this.joystick.getDirection())
    }
  }

  private createPlayerSprite() {
    // 创建待机帧 - 正面
    this.createPlayerFrame('player-idle-front', 0, 0, 'front')
    this.createPlayerFrame('player-idle-back', 0, 0, 'back')
    this.createPlayerFrame('player-idle-left', 0, 0, 'side')
    this.createPlayerFrame('player-idle-right', 0, 0, 'side')
    
    // 创建行走动画帧 - 正面 (向下)
    this.createPlayerFrame('player-walk-front1', -2, 1, 'front')
    this.createPlayerFrame('player-walk-front2', 0, 0, 'front')
    this.createPlayerFrame('player-walk-front3', 2, -1, 'front')
    
    // 创建行走动画帧 - 背面 (向上)
    this.createPlayerFrame('player-walk-back1', -2, 1, 'back')
    this.createPlayerFrame('player-walk-back2', 0, 0, 'back')
    this.createPlayerFrame('player-walk-back3', 2, -1, 'back')
    
    // 创建行走动画帧 - 左侧 (使用基础侧面形状)
    this.createPlayerFrame('player-walk-left1', -2, 1, 'side')
    this.createPlayerFrame('player-walk-left2', 0, 0, 'side')
    this.createPlayerFrame('player-walk-left3', 2, -1, 'side')
    
    // 创建行走动画帧 - 右侧 (使用相同形状但镜像)
    this.createPlayerFrame('player-walk-right1', -2, 1, 'side')
    this.createPlayerFrame('player-walk-right2', 0, 0, 'side')
    this.createPlayerFrame('player-walk-right3', 2, -1, 'side')
    
    // 保持向后兼容的旧帧名
    this.createPlayerFrame('player-idle', 0, 0, 'front')
    this.createPlayerFrame('player-walk1', -2, 1, 'front')
    this.createPlayerFrame('player-walk2', 0, 0, 'front')
    this.createPlayerFrame('player-walk3', 2, -1, 'front')
  }

  private createPlayerFrame(frameName: string, armOffset: number, legOffset: number, direction: string = 'front') {
    const graphics = this.add.graphics()
    
    // 根据方向绘制不同的角色视图
    if (direction === 'front') {
      this.drawPlayerFront(graphics, armOffset, legOffset)
    } else if (direction === 'back') {
      this.drawPlayerBack(graphics, armOffset, legOffset)
    } else if (direction === 'side') {
      this.drawPlayerSide(graphics, armOffset, legOffset)
    }

    graphics.generateTexture(frameName, 64, 64)
    graphics.destroy()
  }

  private drawPlayerFront(graphics: Phaser.GameObjects.Graphics, armOffset: number, legOffset: number) {
    // 头发轮廓 (金棕色)
    graphics.fillStyle(0xd4a574)
    graphics.fillRect(18, 10, 28, 20) // 头发主体
    graphics.fillRect(22, 8, 20, 4)   // 刘海
    graphics.fillRect(16, 14, 4, 10)  // 左侧头发
    graphics.fillRect(44, 14, 4, 10)  // 右侧头发
    
    // 头发高光
    graphics.fillStyle(0xf4d2a0)
    graphics.fillRect(20, 10, 6, 4)   // 左侧高光
    graphics.fillRect(38, 10, 6, 4)   // 右侧高光
    graphics.fillRect(24, 12, 16, 2)  // 顶部高光
    
    // 脸部轮廓 (肉色)
    graphics.fillStyle(0xfdbcb4)
    graphics.fillRect(20, 16, 24, 18) // 脸部主体
    graphics.fillRect(18, 20, 2, 8)   // 左脸颊
    graphics.fillRect(44, 20, 2, 8)   // 右脸颊
    
    // 面部阴影
    graphics.fillStyle(0xf0a895)
    graphics.fillRect(20, 30, 24, 4)  // 下巴阴影
    graphics.fillRect(18, 26, 2, 4)   // 左脸阴影
    graphics.fillRect(44, 26, 2, 4)   // 右脸阴影
    
    // 眼睛
    graphics.fillStyle(0xffffff)      // 眼白
    graphics.fillRect(24, 20, 6, 4)   // 左眼
    graphics.fillRect(34, 20, 6, 4)   // 右眼
    
    graphics.fillStyle(0x2c3e50)      // 瞳孔
    graphics.fillRect(26, 21, 3, 2)   // 左瞳孔
    graphics.fillRect(36, 21, 3, 2)   // 右瞳孔
    
    graphics.fillStyle(0x1a252f)      // 眼睛轮廓
    graphics.fillRect(24, 19, 6, 1)   // 左眼上轮廓
    graphics.fillRect(34, 19, 6, 1)   // 右眼上轮廓
    graphics.fillRect(24, 24, 6, 1)   // 左眼下轮廓
    graphics.fillRect(34, 24, 6, 1)   // 右眼下轮廓
    
    // 鼻子
    graphics.fillStyle(0xf0a895)
    graphics.fillRect(31, 25, 2, 1)   // 鼻子
    
    // 嘴巴
    graphics.fillStyle(0xe74c3c)
    graphics.fillRect(30, 27, 4, 1)   // 嘴唇
    
    // 身体 - 上衣 (蓝色冒险者服装)
    graphics.fillStyle(0x3498db)      // 主色
    graphics.fillRect(16, 34, 32, 20) // 身体主体
    graphics.fillRect(12 + armOffset, 38, 8, 12)  // 左袖 (可摆动)
    graphics.fillRect(44 - armOffset, 38, 8, 12)  // 右袖 (可摆动)
    
    // 上衣细节
    graphics.fillStyle(0x2980b9)      // 深蓝阴影
    graphics.fillRect(16, 50, 32, 4)  // 下摆阴影
    graphics.fillRect(12 + armOffset, 46, 8, 4)   // 左袖阴影
    graphics.fillRect(44 - armOffset, 46, 8, 4)   // 右袖阴影
    
    // 上衣装饰
    graphics.fillStyle(0xf39c12)      // 金色装饰
    graphics.fillRect(18, 36, 28, 2)  // 领口装饰
    graphics.fillRect(30, 40, 4, 8)   // 中央装饰
    
    // 手臂 (肉色，跟随袖子摆动)
    graphics.fillStyle(0xfdbcb4)
    graphics.fillRect(8 + armOffset, 38, 4, 8)    // 左手臂
    graphics.fillRect(52 - armOffset, 38, 4, 8)   // 右手臂
    
    // 手 (肉色，跟随手臂摆动)
    graphics.fillStyle(0xfdbcb4)
    graphics.fillRect(6 + armOffset, 46, 6, 6)    // 左手
    graphics.fillRect(52 - armOffset, 46, 6, 6)   // 右手
    
    // 裤子 (深紫色，腿部可摆动)
    graphics.fillStyle(0x8e44ad)
    graphics.fillRect(20 - legOffset, 54, 10, 12) // 左腿裤子
    graphics.fillRect(34 + legOffset, 54, 10, 12) // 右腿裤子
    
    // 裤子装饰
    graphics.fillStyle(0x663399)      // 更深的紫色
    graphics.fillRect(20 - legOffset, 62, 10, 4)  // 左腿阴影
    graphics.fillRect(34 + legOffset, 62, 10, 4)  // 右腿阴影
    
    // 腿 (肉色，从裤子下方露出，跟随裤子)
    graphics.fillStyle(0xfdbcb4)
    graphics.fillRect(22 - legOffset, 60, 6, 6)   // 左腿
    graphics.fillRect(36 + legOffset, 60, 6, 6)   // 右腿
    
    // 鞋子 (棕色，跟随腿部)
    graphics.fillStyle(0x8b4513)
    graphics.fillRect(18 - legOffset, 58, 12, 6)  // 左鞋
    graphics.fillRect(34 + legOffset, 58, 12, 6)  // 右鞋
    
    // 鞋子细节
    graphics.fillStyle(0x654321)      // 深棕色
    graphics.fillRect(18 - legOffset, 62, 12, 2)  // 左鞋底
    graphics.fillRect(34 + legOffset, 62, 12, 2)  // 右鞋底
  }

  private drawPlayerBack(graphics: Phaser.GameObjects.Graphics, armOffset: number, legOffset: number) {
    // 头发轮廓 (金棕色) - 背面视图
    graphics.fillStyle(0xd4a574)
    graphics.fillRect(18, 10, 28, 20) // 头发主体
    graphics.fillRect(16, 14, 4, 16)  // 左侧头发
    graphics.fillRect(44, 14, 4, 16)  // 右侧头发
    graphics.fillRect(20, 26, 24, 4)  // 后脑勺头发
    
    // 头发高光
    graphics.fillStyle(0xf4d2a0)
    graphics.fillRect(20, 12, 6, 4)   // 左侧高光
    graphics.fillRect(38, 12, 6, 4)   // 右侧高光
    graphics.fillRect(24, 14, 16, 2)  // 顶部高光
    
    // 脸部轮廓 (肉色) - 只显示耳朵和脖子
    graphics.fillStyle(0xfdbcb4)
    graphics.fillRect(16, 20, 4, 8)   // 左耳
    graphics.fillRect(44, 20, 4, 8)   // 右耳
    graphics.fillRect(28, 30, 8, 4)   // 脖子
    
    // 身体 - 上衣背面 (蓝色冒险者服装)
    graphics.fillStyle(0x3498db)      // 主色
    graphics.fillRect(16, 34, 32, 20) // 身体主体
    graphics.fillRect(12 + armOffset, 38, 8, 12)  // 左袖 (可摆动)
    graphics.fillRect(44 - armOffset, 38, 8, 12)  // 右袖 (可摆动)
    
    // 上衣细节
    graphics.fillStyle(0x2980b9)      // 深蓝阴影
    graphics.fillRect(16, 50, 32, 4)  // 下摆阴影
    graphics.fillRect(12 + armOffset, 46, 8, 4)   // 左袖阴影
    graphics.fillRect(44 - armOffset, 46, 8, 4)   // 右袖阴影
    
    // 背部装饰
    graphics.fillStyle(0xf39c12)      // 金色装饰
    graphics.fillRect(28, 36, 8, 2)   // 背部装饰线
    
    // 手臂背面 (肉色，跟随袖子摆动)
    graphics.fillStyle(0xfdbcb4)
    graphics.fillRect(8 + armOffset, 38, 4, 8)    // 左手臂
    graphics.fillRect(52 - armOffset, 38, 4, 8)   // 右手臂
    
    // 手背面 (肉色，跟随手臂摆动)
    graphics.fillStyle(0xfdbcb4)
    graphics.fillRect(6 + armOffset, 46, 6, 6)    // 左手
    graphics.fillRect(52 - armOffset, 46, 6, 6)   // 右手
    
    // 裤子背面 (深紫色，腿部可摆动)
    graphics.fillStyle(0x8e44ad)
    graphics.fillRect(20 - legOffset, 54, 10, 12) // 左腿裤子
    graphics.fillRect(34 + legOffset, 54, 10, 12) // 右腿裤子
    
    // 裤子装饰
    graphics.fillStyle(0x663399)      // 更深的紫色
    graphics.fillRect(20 - legOffset, 62, 10, 4)  // 左腿阴影
    graphics.fillRect(34 + legOffset, 62, 10, 4)  // 右腿阴影
    
    // 腿背面 (肉色，从裤子下方露出，跟随裤子)
    graphics.fillStyle(0xfdbcb4)
    graphics.fillRect(22 - legOffset, 60, 6, 6)   // 左腿
    graphics.fillRect(36 + legOffset, 60, 6, 6)   // 右腿
    
    // 鞋子背面 (棕色，跟随腿部)
    graphics.fillStyle(0x8b4513)
    graphics.fillRect(18 - legOffset, 58, 12, 6)  // 左鞋
    graphics.fillRect(34 + legOffset, 58, 12, 6)  // 右鞋
    
    // 鞋子细节
    graphics.fillStyle(0x654321)      // 深棕色
    graphics.fillRect(18 - legOffset, 62, 12, 2)  // 左鞋底
    graphics.fillRect(34 + legOffset, 62, 12, 2)  // 右鞋底
  }

  private drawPlayerSide(graphics: Phaser.GameObjects.Graphics, armOffset: number, legOffset: number) {
    // 创建左侧视图 (右侧会通过镜像处理)
    
    // 头发轮廓 (金棕色) - 侧面视图
    graphics.fillStyle(0xd4a574)
    graphics.fillRect(20, 10, 24, 20) // 头发主体
    graphics.fillRect(18, 14, 4, 12)  // 侧面头发
    graphics.fillRect(22, 8, 16, 4)   // 顶部头发
    
    // 头发高光
    graphics.fillStyle(0xf4d2a0)
    graphics.fillRect(22, 10, 12, 2)  // 顶部高光
    graphics.fillRect(24, 12, 8, 2)   // 侧面高光
    
    // 脸部轮廓 (肉色) - 侧面
    graphics.fillStyle(0xfdbcb4)
    graphics.fillRect(22, 16, 16, 18) // 脸部主体侧面
    graphics.fillRect(20, 20, 2, 8)   // 脸颊
    
    // 面部阴影
    graphics.fillStyle(0xf0a895)
    graphics.fillRect(22, 30, 16, 4)  // 下巴阴影
    
    // 眼睛 - 侧面只显示一只眼，朝向左侧
    graphics.fillStyle(0xffffff)      // 眼白
    graphics.fillRect(24, 20, 8, 4)   // 眼睛 (稍微拉长)
    
    graphics.fillStyle(0x2c3e50)      // 瞳孔 - 朝向左侧
    graphics.fillRect(25, 21, 3, 2)   // 瞳孔位置偏左
    
    graphics.fillStyle(0x1a252f)      // 眼睛轮廓
    graphics.fillRect(24, 19, 8, 1)   // 上轮廓
    graphics.fillRect(24, 24, 8, 1)   // 下轮廓
    graphics.fillRect(24, 20, 1, 4)   // 左轮廓
    graphics.fillRect(31, 20, 1, 4)   // 右轮廓
    
    // 鼻子 - 侧面突出
    graphics.fillStyle(0xf0a895)
    graphics.fillRect(22, 24, 3, 3)   // 鼻子更突出
    
    // 嘴巴 - 侧面
    graphics.fillStyle(0xe74c3c)
    graphics.fillRect(24, 27, 4, 1)   // 嘴唇
    
    // 身体 - 上衣侧面
    graphics.fillStyle(0x3498db)      // 主色
    graphics.fillRect(16, 34, 32, 20) // 身体主体
    
    // 手臂侧面 - 位于身体中央
    graphics.fillStyle(0x3498db)
    graphics.fillRect(28 + armOffset, 38, 8, 12)  // 袖子在身体中央
    graphics.fillStyle(0xfdbcb4)
    graphics.fillRect(26 + armOffset, 40, 4, 8)   // 手臂在身体中央
    graphics.fillRect(24 + armOffset, 48, 6, 6)   // 手在身体中央
    
    // 上衣细节
    graphics.fillStyle(0x2980b9)      // 深蓝阴影
    graphics.fillRect(16, 50, 32, 4)  // 下摆阴影
    graphics.fillRect(28 + armOffset, 46, 8, 4)   // 袖阴影
    
    // 上衣装饰
    graphics.fillStyle(0xf39c12)      // 金色装饰
    graphics.fillRect(18, 36, 28, 2)  // 装饰线
    
    // 裤子侧面 (深紫色)
    graphics.fillStyle(0x8e44ad)
    graphics.fillRect(20 - legOffset, 54, 10, 12) // 前腿裤子
    graphics.fillRect(34 + legOffset, 54, 10, 12) // 后腿裤子
    
    // 裤子装饰
    graphics.fillStyle(0x663399)      // 更深的紫色
    graphics.fillRect(20 - legOffset, 62, 10, 4)  // 前腿阴影
    graphics.fillRect(34 + legOffset, 62, 10, 4)  // 后腿阴影
    
    // 腿侧面 (肉色)
    graphics.fillStyle(0xfdbcb4)
    graphics.fillRect(22 - legOffset, 60, 6, 6)   // 前腿
    graphics.fillRect(36 + legOffset, 60, 6, 6)   // 后腿
    
    // 鞋子侧面 (棕色)
    graphics.fillStyle(0x8b4513)
    graphics.fillRect(18 - legOffset, 58, 12, 6)  // 前鞋
    graphics.fillRect(34 + legOffset, 58, 12, 6)  // 后鞋
    
    // 鞋子细节
    graphics.fillStyle(0x654321)      // 深棕色
    graphics.fillRect(18 - legOffset, 62, 12, 2)  // 前鞋底
    graphics.fillRect(34 + legOffset, 62, 12, 2)  // 后鞋底
  }

  private createJoystickGraphics() {
    const baseGraphics = this.add.graphics()
    const stickGraphics = this.add.graphics()
    
    // 摇杆底座
    baseGraphics.lineStyle(4, 0x34495e, 0.5)
    baseGraphics.fillStyle(0x2c3e50, 0.3)
    baseGraphics.fillCircle(40, 40, 40)
    baseGraphics.strokeCircle(40, 40, 40)
    baseGraphics.generateTexture('joystick-base', 80, 80)
    
    // 摇杆手柄
    stickGraphics.fillStyle(0x3498db, 0.8)
    stickGraphics.fillCircle(15, 15, 15)
    stickGraphics.lineStyle(2, 0x2980b9, 1)
    stickGraphics.strokeCircle(15, 15, 15)
    stickGraphics.generateTexture('joystick-stick', 30, 30)
    
    baseGraphics.destroy()
    stickGraphics.destroy()
  }

  private createHouseSprites() {
    const houseGraphics = this.add.graphics()
    
    // 创建 80x80 的像素风格小房子
    
    // 房屋基础 (棕色木质)
    houseGraphics.fillStyle(0x8b4513)
    houseGraphics.fillRect(10, 30, 60, 40) // 房屋主体
    
    // 房屋阴影
    houseGraphics.fillStyle(0x654321)
    houseGraphics.fillRect(65, 35, 5, 35) // 右侧阴影
    houseGraphics.fillRect(15, 65, 55, 5) // 底部阴影
    
    // 屋顶 (红色瓦片)
    houseGraphics.fillStyle(0xdc143c)
    houseGraphics.fillRect(5, 20, 70, 20) // 屋顶主体
    houseGraphics.fillRect(0, 15, 80, 10) // 屋顶顶部
    
    // 屋顶阴影
    houseGraphics.fillStyle(0xa0112a)
    houseGraphics.fillRect(70, 20, 10, 15) // 屋顶右侧阴影
    houseGraphics.fillRect(5, 35, 70, 5)   // 屋顶底部阴影
    
    // 门 (深棕色)
    houseGraphics.fillStyle(0x4a2c17)
    houseGraphics.fillRect(25, 50, 12, 20) // 门框
    
    // 门细节
    houseGraphics.fillStyle(0x654321)
    houseGraphics.fillRect(27, 52, 8, 16) // 门板
    houseGraphics.fillRect(33, 58, 2, 2)  // 门把手
    
    // 窗户1 (蓝色玻璃)
    houseGraphics.fillStyle(0x2980b9)
    houseGraphics.fillRect(45, 45, 12, 10) // 右窗户
    
    // 窗框 (深棕色)
    houseGraphics.fillStyle(0x4a2c17)
    houseGraphics.fillRect(44, 44, 14, 12) // 窗框外围
    houseGraphics.fillRect(50, 44, 2, 12)  // 窗框中间分隔
    houseGraphics.fillRect(44, 49, 14, 2)  // 窗框水平分隔
    
    // 窗户2 (左侧小窗)
    houseGraphics.fillStyle(0x2980b9)
    houseGraphics.fillRect(15, 40, 8, 8) // 左窗户
    
    houseGraphics.fillStyle(0x4a2c17)
    houseGraphics.fillRect(14, 39, 10, 10) // 左窗框
    houseGraphics.fillRect(18, 39, 2, 10)  // 窗框分隔
    houseGraphics.fillRect(14, 43, 10, 2)  // 窗框分隔
    
    // 烟囱
    houseGraphics.fillStyle(0x5d4e37)
    houseGraphics.fillRect(55, 10, 8, 15) // 烟囱主体
    
    houseGraphics.fillStyle(0x4a3728)
    houseGraphics.fillRect(60, 12, 3, 13) // 烟囱阴影
    
    // 烟雾 (淡灰色)
    houseGraphics.fillStyle(0xbdc3c7)
    houseGraphics.fillRect(57, 5, 2, 3)   // 烟雾1
    houseGraphics.fillRect(59, 2, 2, 4)   // 烟雾2
    houseGraphics.fillRect(56, 0, 3, 2)   // 烟雾3
    
    // 装饰性细节
    houseGraphics.fillStyle(0x27ae60) // 绿色植物
    houseGraphics.fillRect(12, 67, 4, 3) // 左侧小草
    houseGraphics.fillRect(64, 68, 4, 2) // 右侧小草
    
    houseGraphics.fillStyle(0xe74c3c) // 红色花朵
    houseGraphics.fillRect(40, 69, 2, 1) // 小花
    
    houseGraphics.generateTexture('house', 80, 80)
    houseGraphics.destroy()
  }

  private setupWorld() {
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 414, 736)
    
    // 创建简单的背景
    this.add.rectangle(207, 368, 414, 736, 0x27ae60, 0.3)
    
    // 添加一些装饰性的像素元素
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(20, 394)
      const y = Phaser.Math.Between(20, 600)
      const size = Phaser.Math.Between(4, 8)
      this.add.rectangle(x, y, size, size, 0x2ecc71, 0.6)
    }
  }

  private createPlayer() {
    this.player = new Player(this, 207, 368)
    this.add.existing(this.player)
  }

  private createHouses() {
    // 创建静态物理组用于房子碰撞
    this.houses = this.physics.add.staticGroup()
    
    // 房子1 - 左上角
    const house1 = this.physics.add.staticSprite(100, 150, 'house')
    house1.setDepth(1)
    house1.body!.setSize(70, 50, true) // 设置碰撞体积 (宽70, 高50)
    house1.body!.setOffset(5, 20)      // 设置偏移，避开屋顶部分
    this.houses.add(house1)
    
    // 房子2 - 右上角
    const house2 = this.physics.add.staticSprite(320, 120, 'house')
    house2.setDepth(1)
    house2.body!.setSize(70, 50, true)
    house2.body!.setOffset(5, 20)
    this.houses.add(house2)
    
    // 房子3 - 中间偏下
    const house3 = this.physics.add.staticSprite(200, 450, 'house')
    house3.setDepth(1)
    house3.body!.setSize(70, 50, true)
    house3.body!.setOffset(5, 20)
    this.houses.add(house3)
    
    // 设置玩家与房子的碰撞
    this.physics.add.collider(this.player, this.houses)
  }

  private createJoystick() {
    this.joystick = new VirtualJoystick(this)
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys()
    
    // 支持键盘控制作为备用
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      // 这里可以添加键盘控制逻辑
    })
  }
}