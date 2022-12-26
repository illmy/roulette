// pages/list/list.js
var util = require('../../utils/util.js')
var xiaojueding = require('../../utils/xiaojueding.js');
var app = getApp();
const db = wx.cloud.database();
// 在页面中定义插屏广告
let interstitialAd = null
Page({
   data: {
      xiaojueding: xiaojueding,
      myxiaojueding: [],
      tab_index: 2,
   },

   //收藏
   officialQToKeep(e) {
      if(this.data.myxiaojueding.length>=10){
         wx.showModal({
            title: '个人小决定最多保存10个哦～',
            showCancel:false
          })
         return
      }
      var that = this, index = e.currentTarget.dataset.index, myJuedin = this.data.myxiaojueding, xiaojueding = that.data.xiaojueding, flag = true;
      myJuedin = util.isNull(myJuedin) ? [] : myJuedin;
      for (let x in xiaojueding) {
         if (x == index) {
            if (myJuedin.length == 0) {
               myJuedin.push(xiaojueding[x]);
               that.cloudUpdate(myJuedin);
               wx.setStorageSync('myJuedin', myJuedin);
               wx.showToast({
                  title: '收藏成功',
                  icon: 'success',
                  mask: false
               })
            } else {
               for (let i in myJuedin) {
                  if (myJuedin[i].id == xiaojueding[x].id) {
                     flag = false;
                     break;
                  }
               }
               if (flag) {
                  myJuedin.push(xiaojueding[x]);
                  that.cloudUpdate(myJuedin)
                  wx.setStorageSync('myJuedin', myJuedin);
                  wx.showToast({
                     title: '收藏成功',
                     icon: 'success',
                     mask: false
                  })
               }
            }
            break;
         }
      }
      that.setData({
         xiaojueding: xiaojueding
      })
   },

   //删除
   personalQToDelete(e) {
      var that = this, index = e.currentTarget.dataset.index, myJuedin = this.data.myxiaojueding;
      for (let i in myJuedin) {
         if (index == i) {
            myJuedin.splice(i, 1);
            wx.showToast({
               title: '删除成功',
               icon: 'success',
               mask: false
            })
            break;
         }
      }
      that.setData({
         myxiaojueding: myJuedin
      })
      that.cloudUpdate(myJuedin)
      wx.setStorageSync('myJuedin', myJuedin);
   },

   onLoad: function (options) {
      // 在页面onLoad回调事件中创建插屏广告实例
      if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
         adUnitId: 'adunit-f45ef2b0b404a94d'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
      }
   },
   cloudUpdate(a){
      var that = this;
      if(!this.data.ifEdit){
         db.collection('jueding').add({
            // data 字段表示需新增的 JSON 数据
            data: {
              myJuedin:a
            },
            success: function(res) {
              // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
              that.setData({
                 myxiaojueding:a
              })
              console.log(res)
            }
          })
      }else{
         db.collection('jueding').doc(this.data.jueding_id).set({
            data: {
               myJuedin:a
            },
            success: function(res) {
               that.setData({
                  myxiaojueding:a
               })
              console.log(res.data)
            }
          })
      }
   },
   //热门、个人小决定
   tabSwitch(e) {
      var that = this, flg = e.currentTarget.dataset.flg, myJuedin = this.data.myxiaojueding;
      if (flg == 2) {
         that.setData({
            myxiaojueding: myJuedin
         })
      // }else{
      //    // 在适合的场景显示插屏广告
      //    if (interstitialAd) {
      //       interstitialAd.show().catch((err) => {
      //       console.error(err)
      //       })
      //    }
      }
      that.setData({
         tab_index: flg == 1 ? '1' : '2'
      })
   },

   //添加个人小决定
   addPersonalQ(e) {
      if(this.data.myxiaojueding.length>=10){
         wx.showModal({
           title: '个人小决定最多保存10个哦～',
           showCancel:false
         })
         return
      }
      wx.navigateTo({
         url: '../edit/edit?flg=2',
      })
   },

   //个人编辑
   personalQToRevise(e) {
      var that = this, myJuedin = this.data.myxiaojueding, index = e.currentTarget.dataset.index;
      for (let i in myJuedin) {
         if (i == index) {
            wx.navigateTo({
               url: '../edit/edit?item=' + JSON.stringify(myJuedin[i])
            })
            return;
         }
      }
   },

   //热门编辑
   officialQToRevise(e) {
      if(this.data.myxiaojueding.length>=10){
         wx.showModal({
           title: '个人小决定最多保存10个哦～',
           showCancel:false
         })
         return
      }
      var that = this, xiaojueding = that.data.xiaojueding, index = e.currentTarget.dataset.index;
      for (let i in xiaojueding) {
         if (i == index) {
            wx.navigateTo({
               url: '../edit/edit?flg=1&item=' + JSON.stringify(xiaojueding[i])
            })
            return;
         }
      }
   },

   //个人决定右边的图片
   personalQToControl(e) {
      var that = this, index = e.currentTarget.dataset.index, idx, myxiaojueding = that.data.myxiaojueding;
      for (let x in myxiaojueding) {
         if (x == index) {
            idx = myxiaojueding[x].num1 == undefined ? index : undefined;
            myxiaojueding[x].num1 = idx;
         } else {
            myxiaojueding[x].num1 = undefined;
         }
      }
      that.setData({
         myxiaojueding: myxiaojueding
      })
   },

   //热门决定右边的图片
   officialQToControl(e) {
      var that = this, index = e.currentTarget.dataset.index, idx;
      for (let x in xiaojueding) {
         if (x == index) {
            idx = xiaojueding[x].num == undefined ? index : undefined;
            xiaojueding[x].num = idx;
         } else {
            xiaojueding[x].num = undefined;
         }
      }
      that.setData({
         xiaojueding: xiaojueding
      })
   },


   //热门决定的标题
   officialQToRun(e) {
      var that = this, id = e.currentTarget.dataset.id;
      app.globalData.defaultJueding = true;
      id = id == 0 ? '00' : id;
      wx.setStorageSync('switchTab', id);
      wx.switchTab({
         url: '../index/index'
      })
   },

   //个人决定的标题
   personalQToRun(e) {
      var that = this, id = e.currentTarget.dataset.item.id;
      app.globalData.myJueding = true;
      wx.setStorageSync('switchTab', id);
     var all = this.data.xiaojueding;
     all.push(e.currentTarget.dataset.item);
     wx.setStorageSync('all', all);
      wx.switchTab({
         url: '../index/index'
      })
   },

   onShow: function () {
      var that = this;
      wx.removeStorageSync('jueding_item');
      db.collection('jueding').get({
         success: function(res) {
           // res.data 包含该记录的数据
           if(res.data.length==0){
            that.setData({
               ifEdit:false
            })
           }else{
            that.setData({
               ifEdit:true,
               myxiaojueding:res.data[0].myJuedin,
               jueding_id:res.data[0]._id,
            })
            wx.setStorageSync('jueding_item', res.data[0]);
            console.log(res)
           }
         },
         fail: function(res) {},
       })
      app.globalData.defaultJueding = false, app.globalData.myJueding = false;

      wx.removeStorageSync('switchTab');
      // 在适合的场景显示插屏广告
      if (interstitialAd) {
         interstitialAd.show().catch((err) => {
         console.error(err)
         })
      }
   },

   onShareAppMessage: function () {
      let that = this;
      mta.Event.stat("share", { 'time': '1' });
      var picNum = Math.floor(Math.random() * 4 + 1);//获取1-4的随机数，用于随机展示分享图片

      return {
         title: util.isNull(app.globalData.shareTitle) ? ("一起来玩'" + app.globalData.title + "'吧") : app.globalData.shareTitle,
         path: '/pages/index/index',
         success: function (res) {

         },
         fail: function (res) {
         }
      }
   }
})