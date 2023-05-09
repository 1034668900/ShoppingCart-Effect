/* 
    分析：购物车效果中，每个商品后续会多一个商品选中数量的属性，为了避免修改源数据，
    通过一个类来批量创建商品对象
*/

// 单个商品的数据
class CreateUIGoods{
    // 构造函数
    constructor(good){
        // 商品源数据
        this.data = good
        // 商品选中数量
        this.count = 0
    }
    // 方法

    // 获取单件商品总价
    getTotalPrice(){
        return this.data.price * this.count
    }

    // 判断商品是否选中(用于后续判断-号按钮是否显示)
    isChoose(){
        return this.count > 0
    }

    // 商品数量 +1
    addCount(){
        this.count++
    }
    
    // 商品数量 -1
    subCount(){
        // 商品数量不可能为负数
        if(this.count <= 0){
            return;
        }
        this.count--
    }

}

// 整个界面的数据

class UIData{
    constructor(){
        // 获得整个页面的商品数据(map 函数遍历数组会返回一个经回调处理后的新数组)
        this.UIGoods = goods.map(item => new CreateUIGoods(item))

        // 起送费
        this.initDeliveryPrice = 30
        // 配送费
        this.deliveryPrice = 5
    }

    // 获取购物车总价
    getCartTotalPrice(){
        // 利用reduce函数求总价，赋初始总价为0  回调函数的返回值就是第一个回调参数的值
        return this.UIGoods.reduce((totalPrice,item) => {
            // item 是数组中的单件商品,数组中的单件商品有一个获得当前单件商品总价的函数getTotalPrice
            return totalPrice + item.getTotalPrice()
        },0)
    }

    // 重新封装添加某件商品的数量
    addCount(index){
        // 调用单件商品里添加商品数量的方法
        this.UIGoods[index].addCount()
    }

    // 重新封装减少某件商品的数量
    subCount(index){
        this.UIGoods[index].subCount()
    }

    // 重新封装获得购物车中商品总选中数量
    getCartTotalCount(){
        return this.UIGoods.reduce((totalCount, item) => {
            // 遍历UIGoods中的商品，统计商品总的选择数量
            return totalCount + item.count
        },0)
    }

    // 重新封装判断购物车中是否有商品
    hasGoodsInCart(){
        return this.getCartTotalCount() > 0
    }

    // 重新封装判断商品是否选中
    isChoose(index){
         return this.UIGoods[index].isChoose()
    }

    // 重新封装判断选中商品总价格是否超过起送费
    isOverInitDeliveryPrice(){
        return this.getCartTotalPrice() >= this.initDeliveryPrice
    }

}

// 整个界面
/* 
    面向对象的编程方式，将商品UI界面应该有的功能都封装到最终的类里，后续只对该类的唯一一个对象进行操作
*/
class UI{
    constructor(){
        // 拿到整个界面的数据
        this.uiData = new UIData()
        // 获得页面中的DOM元素
        this.doms = {
            goodsContainer: document.querySelector('.goods-list')
        }
        // 创建商品列表是一开始就要进行的，避免构造函数中代码臃肿，此处将该功能封装
        this.createHTML()

    }

    // 根据商品数据创建商品列表
    createHTML(){
        /* 两种实现思路：
            1. 利用模板字符串生成HTML字符串 再添加到父元素   (有解析HTML过程，执行效率较低,开发效率较高)
            2. 一个一个元素的创建并将其添加到父元素          (执行效率高，开发效率低)
            3. 永远不要优先考虑效率
        */
        // 该种方法实现有效率问题，不断在改变DOM树
        this.uiData.UIGoods.forEach(item => {
            // 调用createGood创建每个商品的数据
            let good = this.createGood(item.data.pic, item.data.title, item.data.desc, item.data.sellNumber, item.data.favorRate,item.data.price)
            // 将该商品添加到商品列表div
            this.doms.goodsContainer.insertAdjacentHTML("beforeend",good)
        })
    }

    // 创建每个商品数据
    createGood(src , title , desc, sellNumber, favorRate, price){
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
              <i class="iconfont i-jianhao"></i>
              <span>0</span>
              <i class="iconfont i-jiajianzujianjiahao"></i>
            </div>
          </div>
        </div>
      </div>`
        return good
    }

    // 重新封装添加商品数量 商品数量更新后也应该更新其显示状态
    addCount(index){
        this.uiData.addCount(index)
        this.updateGoodsItem(index)
    }

    // 重新封装减少商品数量
    subCount(index){
        this.uiData.subCount(index)
        this.updateGoodsItem(index)
    }

    // 更新商品显示状态
    updateGoodsItem(index){
        // 先拿到该商品
        let good = this.doms.goodsContainer.children[index]
        // 判断该商品是否应该有active属性 (CSS样式中设置的类属性，如果有，则显示 UI界面的 -号 )
        if(this.uiData.isChoose(index)){
            good.classList.add('active')
        }else{
            good.classList.remove('active')
        }
        // 找到该商品的价格对象
        let goodSpan = good.querySelector('.goods-btns span')
        // 更新商品价格
        goodSpan.textContent = this.uiData.UIGoods[index].count

    }
}

const ui = new UI()