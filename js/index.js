/* 
    分析：购物车效果中，每个商品后续会多一个商品选中数量的属性，为了避免修改源数据，
    通过一个类来批量创建商品对象
*/

// 单个商品的数据
class CreateUIGoods {
    // 构造函数
    constructor(good) {
        // 商品源数据
        this.data = good
        // 商品选中数量
        this.count = 0
    }
    // 方法

    // 获取单件商品总价
    getTotalPrice() {
        return this.data.price * this.count
    }

    // 判断商品是否选中(用于后续判断-号按钮是否显示)
    isChoose() {
        return this.count > 0
    }

    // 商品数量 +1
    addCount() {
        this.count++
    }

    // 商品数量 -1
    subCount() {
        // 商品数量不可能为负数
        if (this.count <= 0) {
            return;
        }
        this.count--
    }

}

// 整个界面的数据

class UIData {
    constructor() {
        // 获得整个页面的商品数据(map 函数遍历数组会返回一个经回调处理后的新数组)
        this.UIGoods = goods.map(item => new CreateUIGoods(item))

        // 起送费
        this.initDeliveryPrice = 30
        // 配送费
        this.deliveryPrice = 5

    }

    // 获取购物车总价
    getCartTotalPrice() {
        // 利用reduce函数求总价，赋初始总价为0  回调函数的返回值就是第一个回调参数的值
        return this.UIGoods.reduce((totalPrice, item) => {
            // item 是数组中的单件商品,数组中的单件商品有一个获得当前单件商品总价的函数getTotalPrice
            return totalPrice + item.getTotalPrice()
        }, 0)
    }

    // 重新封装添加某件商品的数量
    addCount(index) {
        // 调用单件商品里添加商品数量的方法
        this.UIGoods[index].addCount()
    }

    // 重新封装减少某件商品的数量
    subCount(index) {
        this.UIGoods[index].subCount()
    }

    // 获得购物车中商品总选中数量
    getCartTotalCount() {
        return this.UIGoods.reduce((totalCount, item) => {
            // 遍历UIGoods中的商品，统计商品总的选择数量
            return totalCount + item.count
        }, 0)
    }

    // 判断购物车中是否有商品
    hasGoodsInCart() {
        return this.getCartTotalCount() > 0
    }

    // 重新封装判断商品是否选中
    isChoose(index) {
        return this.UIGoods[index].isChoose()
    }

    // 判断选中商品总价格是否超过起送费
    isOverInitDeliveryPrice() {
        return this.getCartTotalPrice() >= this.initDeliveryPrice
    }

}

// 整个界面
/* 
    面向对象的编程方式，将商品UI界面应该有的功能都封装到最终的类里，后续只对该类的唯一一个对象进行操作
*/
class UI {
    constructor() {
        // 拿到整个界面的数据
        this.uiData = new UIData()
        // 获得页面中的DOM元素
        this.doms = {
            // 商品列表父元素
            goodsContainer: document.querySelector('.goods-list'),
            // 配送费相关父元素
            deliveryPrice: document.querySelector('.footer-car-tip'),
            // 起送费相关元素
            initDeliveryPrice: document.querySelector('.footer-pay'),
            initDeliveryPriceSpan: document.querySelector('.footer-pay span'),
            // 总价相关元素
            cartTotalPrice: document.querySelector('.footer-car-total'),
            // 购物车父元素
            cartBox: document.querySelector('.footer-car'),
            // 购物车上标元素
            cartBoxNum: document.querySelector('.footer-car-badge')
        }
        // 创建商品列表是一开始就要进行的，避免构造函数中代码臃肿，此处将该功能封装
        this.createHTML()
        // 页脚也要一开始就更新
        this.updateFooter()

        // 执行监听函数
        this.listenEvents()

        // 动画区域
        // 获取购物车处坐标
        let rectTarget = this.doms.cartBox.getBoundingClientRect()
        const target = {
            x: rectTarget.left + rectTarget.width / 2,
            y: rectTarget.top + rectTarget.height / 4
        }
        this.target = target

    }

    // 监听各种事件
    listenEvents() {
        // 监听购物车动画执行结束后删除animate
        this.doms.cartBox.addEventListener('animationend', () => {
            this.doms.cartBox.classList.remove('animate')
        })
    }

    // 根据商品数据创建商品列表
    createHTML() {
        /* 两种实现思路：
            1. 利用模板字符串生成HTML字符串 再添加到父元素   (有解析HTML过程，执行效率较低,开发效率较高)
            2. 一个一个元素的创建并将其添加到父元素          (执行效率高，开发效率低)
            3. 永远不要优先考虑效率
        */
        // 该种方法实现有效率问题，不断在改变DOM树
        this.uiData.UIGoods.forEach((item, index) => {
            // 调用createGood创建每个商品的数据
            let good = this.createGood(index, item.data.pic, item.data.title, item.data.desc, item.data.sellNumber, item.data.favorRate, item.data.price)
            // 将该商品添加到商品列表div
            this.doms.goodsContainer.insertAdjacentHTML("beforeend", good)
        })
    }

    // 创建每个商品数据
    createGood(index, src, title, desc, sellNumber, favorRate, price) {
        let good =
            ` <div class="goods-item">
        <img src="${src}" alt="" class="goods-pic" />
        <div class="goods-info">
          <h2 class="goods-title">${title}</h2>
          <p class="goods-desc">${desc}</p>
          <p class="goods-sell">
            <span>月售 ${sellNumber}</span>
            <span>好评率${favorRate}%</span>
          </p>
          <div class="goods-confirm">
            <p class="goods-price">
              <span class="goods-price-unit">￥</span>
              <span>${price}</span>
            </p>
            <div class="goods-btns">
              <i index="${index}" class="iconfont i-jianhao"></i>
              <span>0</span>
              <i index="${index}" class="iconfont i-jiajianzujianjiahao"></i>
            </div>
          </div>
        </div>
      </div>`
        return good
    }

    // 重新封装添加商品数量 商品数量更新后也应该更新其显示状态
    addCount(index) {
        this.uiData.addCount(index)
        this.updateGoodsItem(index)
        this.updateFooter()
        this.jump(index)
    }

    // 重新封装减少商品数量
    subCount(index) {
        this.uiData.subCount(index)
        this.updateGoodsItem(index)
        this.updateFooter()
        this.jump(index)
    }

    // 更新商品显示状态
    updateGoodsItem(index) {
        // 先拿到该商品
        let good = this.doms.goodsContainer.children[index]
        // 判断该商品是否应该有active属性 (CSS样式中设置的类属性，如果有，则显示 UI界面的 -号 )
        if (this.uiData.isChoose(index)) {
            good.classList.add('active')
        } else {
            good.classList.remove('active')
        }
        // 找到该商品的价格对象
        let goodSpan = good.querySelector('.goods-btns span')
        // 更新商品价格
        goodSpan.textContent = this.uiData.UIGoods[index].count

    }

    // 更新页脚
    updateFooter() {
        // 获得购物车总价
        let cartTotalPrice = this.uiData.getCartTotalPrice()
        // 获得购物车中商品总数
        let cartTotalCount = this.uiData.getCartTotalCount()

        // 更新配送费
        this.doms.deliveryPrice.textContent = `配送费￥${this.uiData.deliveryPrice}`

        // 更新起送费(更新前应该判断是否超过起送费，两种情况的UI不同)
        if (this.uiData.getCartTotalPrice() > this.uiData.initDeliveryPrice) {
            // 超过了起送费
            this.doms.initDeliveryPrice.classList.add('active')
        } else {
            // 还没超过起送费，更新总价和起送费的差价
            this.doms.initDeliveryPrice.classList.remove('active')
            let difPrice = this.uiData.initDeliveryPrice - cartTotalPrice
            // 小数计算不精确，取整
            difPrice = Math.round(difPrice)
            // 将起送费差价更新到页面
            this.doms.initDeliveryPriceSpan.textContent = `还差￥${difPrice}起送`
        }

        // 更新购物车总价--小数运算不准确，保留两个小数
        this.doms.cartTotalPrice.textContent = `${cartTotalPrice.toFixed(2)}`

        // 设置购物车的样式状态
        if (cartTotalCount > 0) {
            // 说明购物车中有商品
            // 更新购物车样式
            this.doms.cartBox.classList.add('active')
            // 更新购物车数量标
            this.doms.cartBoxNum.textContent = `${cartTotalCount}`
        } else {
            this.doms.cartBox.classList.remove('active')
        }
    }

    // 购物车动画
    cartAnimate() {
        // 为cartBox添加类样式
        this.doms.cartBox.classList.add('animate')
        // 动画完成后需要删除类样式才能保证下一次动画能实现
        // 此处cartAnimate函数每次指定都会创建监听器，这样做不太合适，可以单独提取一个监听各种事件的函数，在构造函数中就执行
        // this.doms.cartBox.addEventListener('animationend',() => {
        //     this.doms.cartBox.classList.remove('animate')
        // })
    }

    // 实现添加商品后加号按钮过渡动画
    jump(index) {
        // 获得目标位置的数据,目标数据一直不会变，可以单独提出，不然每次都会调用执行
        /*   let rectTarget = this.doms.cartBox.getBoundingClientRect()
          const target = {
              x: rectTarget.left + rectTarget.width/2 ,
              y: rectTarget.top + rectTarget.height/4 
          } */

        // 获取每个商品加号按钮的坐标
        let rectItem = this.doms.goodsContainer.children[index].querySelector('.i-jiajianzujianjiahao').getBoundingClientRect()
        let start = {
            x: rectItem.left,
            y: rectItem.top
        }

        // 创建div实现动画
        let div = document.createElement('div')
        div.className = 'add-to-car'
        let i = document.createElement('i')
        i.className = 'iconfont i-jiajianzujianjiahao'
        div.appendChild(i)
        document.body.appendChild(div)
        // 设置初始位置
        div.style.transform = `translateX(${start.x}px)`
        i.style.transform = `translateY(${start.y}px)`


        // 在两个位置过渡中间，必须时页面强行渲染，不然就会先执行完 js再渲染，此时直接以后设置的位置为主了
        // 随便读取DOM元素的属性就可实现强行渲染
        div.clientHeight

        // 设置结束位置
        div.style.transform = `translateX(${this.target.x}px)`
        i.style.transform = `translateY(${this.target.y}px)`

        // 动画执行结束后监听的事件
        div.addEventListener('transitionend', () => {
            //应该删掉创建的div，不然元素会不断累计
            div.remove()
            // 同时调用购物车动画效果
            this.cartAnimate()
        }, {
            // i 元素触发动画时会冒泡到div元素，因此限制只触发一次
            once: true
        })

    }

}

const ui = new UI()

// 事件
// 商品列表的点击事件
ui.doms.goodsContainer.addEventListener('click', (e) => {
    // 拿到点击的加号减号所属商品项的下标
    /* 
        此处拿点击的下标有两种方案
        1. 根据当前点击的+号不断向上找父元素，直到找到每个商品项然后判断在div中的index
        2. 创建每个商品时就为加号按钮的div设置index属性并传入对应的index   (更简单)

    */
    let index = +e.target.getAttribute('index')

    // 判断点击的是否是商品列表里的加号和减号
    if (e.target.classList.contains('i-jiajianzujianjiahao')) {
        // 点击的是加号
        // 使其数量+1
        ui.addCount(index)
    }
    else if (e.target.classList.contains('i-jianhao')) {
        // 点击的是减号
        ui.subCount(index)
    }
})