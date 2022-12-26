// pages/edit/edit.js
var util = require('../../utils/util.js')
var app = getApp()
const db = wx.cloud.database()
Page({
   data: {
      input_answer_list: [],
      default_input_answer_list: {},
      name: '',
      flg: 0,
      colorArr: [//增加选项的默认颜色排序
         '#EE534F',
         '#FF7F50',
         '#FFC928',
         '#66BB6A',
         '#42A5F6',
         '#FF7F50',
         '#AA47BC',
         '#EC407A',
         '#DA70D6',
         '#FFA827',
         '#AA47BC',
         '#EE534F',
         '#42A5F6',
         '#66BB6A',
         '#FFC928',
         '#42A5F6',
         '#5C6BC0',
      ]
   },

   onLoad: function (options) {
      var that = this;
      let jueding_item = wx.getStorageSync('jueding_item');
      if(jueding_item){
         that.setData({
            ifEdit:true
         })
         wx.setStorageSync('myJuedin', jueding_item.myJuedin);
         console.log(jueding_item.myJuedin)
         that.init(options)
      }else{
         that.setData({
            ifEdit:false
         })
         that.init(options)
      }
   },
   init(options){
      var that = this, input_answer_list = [], obj = {}, myJuedin = wx.getStorageSync('myJuedin'), arr = [], all = wx.getStorageSync('all'), default_input_answer_list = that.data.default_input_answer_list, num = wx.getStorageSync('num');
     
      if (options != undefined) {
         //添加个人小决定
         if (options.flg == 2) {
            default_input_answer_list.id = num;
            default_input_answer_list.num = num;
            that.setData({
               default_input_answer_list: default_input_answer_list
            })
            return;
         }

         obj = JSON.parse(options.item);
         //从热门决定编辑跳过来的
         if (options.flg == 1) {
            if (util.isNull(myJuedin)) {
               arr.push(obj);
               wx.setStorageSync('myJuedin', arr);
            } else {
               myJuedin.push(obj);
               wx.setStorageSync('myJuedin', myJuedin);
            }
            that.setData({
               flg: 1
            })
         }
         //个人决定编辑跳过来的
         that.setData({
            input_answer_list: obj.awards,
            default_input_answer_list: obj,
            name: obj.option
         })
      }
   },
   //小决定的名称
   checkQuestion(e) {
      var that = this, val = e.detail.value, default_input_answer_list = that.data.default_input_answer_list;
      default_input_answer_list.option = val
      that.setData({
         name: val,
         default_input_answer_list: default_input_answer_list
      })
   },

   //小决定选项
   checkAnswer(e) {
      var that = this, val = e.detail.value, index = e.currentTarget.dataset.index, input_answer_list = that.data.input_answer_list, default_input_answer_list = that.data.default_input_answer_list;
      for (let i in input_answer_list) {
         if (index == i) {
            input_answer_list[i].name = val
         }
      }
      default_input_answer_list.awards = input_answer_list;
      that.setData({
         input_answer_list: input_answer_list,
         default_input_answer_list: default_input_answer_list
      })
   },

   //增加
   addAnswer() {
      var that = this, input_answer_list = that.data.input_answer_list, colorArr = that.data.colorArr, obj = {};
      if (input_answer_list.length == 17) {
         wx.showToast({
            title: '选项长度最多17项',
            icon:'none',
            mask:false
         })
         return;
      }
      obj = { name: '', color: colorArr[input_answer_list.length] };
      input_answer_list.push(obj);
      that.setData({
         input_answer_list: input_answer_list
      })
   },

   //删除
   subAnswer(e) {
      var that = this, index = e.currentTarget.dataset.index, input_answer_list = that.data.input_answer_list, default_input_answer_list = that.data.default_input_answer_list, colorArr = that.data.colorArr;
      for (let i in input_answer_list) {
         if (i == index) {
            input_answer_list.splice(i, 1);
            break;
         }
      }

      for (let x in input_answer_list){
         input_answer_list[x].color = colorArr[x];
      }

      default_input_answer_list.awards = input_answer_list;
      that.setData({
         input_answer_list: input_answer_list,
         default_input_answer_list: default_input_answer_list
      })
   },

   //保存
   saveQA() {
      var that = this, myJuedin = wx.getStorageSync('myJuedin'), default_input_answer_list = that.data.default_input_answer_list, input_answer_list = that.data.input_answer_list, all = wx.getStorageSync('all'), arr = [];

      if (that.data.name == '') {
         wx.showToast({
            title: '名称不能为空',
            icon: 'none',
            mask: false
         })
      } else {
         for (let y in input_answer_list) {
            if (input_answer_list[y].name == '') {
               wx.showToast({
                  title: '选项不能为空',
                  icon: 'none',
                  mask: false
               })
               return;
            }
         }

         if (input_answer_list.length < 2) {
            wx.showToast({
               title: '选项最少填2个',
               icon: 'none',
               mask: false
            })
            return;
         }
         var jyword = default_input_answer_list.option + "/a丿d/";
         for(let i in default_input_answer_list.awards){
            jyword = jyword + default_input_answer_list.awards[i].name + "/a丿d/"
         }
         console.log(jyword)
         wx.cloud.callFunction({
            name:"msgSecCheck",
            data:{
               inputText:jyword
            },
            success(res){
               if(res.result.errCode == 0){
                  if (util.isNull(myJuedin)) {
                     app.globalData.myJueding = true;
                     arr.push(default_input_answer_list);
                     wx.setStorageSync('myJuedin', arr);
                     wx.setStorageSync('switchTab', default_input_answer_list.id);
                     all.push(default_input_answer_list);
                     wx.setStorageSync('all', all);
                     wx.setStorageSync('num', wx.getStorageSync('num') + 1);
                     that.cloudNum();
                     wx.showToast({
                        title: '保存成功',
                        icon: 'success',
                        mask: false,
                        success: function () {
                           setTimeout(function () {
                              wx.switchTab({
                                 url: '../index/index'
                              })
                           }, 1500)
                        }
                     })
                     return;
                  }
                  let addtype=false;
                  for (let i in myJuedin) {
                     if (default_input_answer_list.num == myJuedin[i].num) {
                        addtype=true
                        myJuedin[i] = default_input_answer_list;
                        wx.setStorageSync('myJuedin', myJuedin);
                        for (let x in all) {
                           if (all[x].id == default_input_answer_list.id) {
                              all[x] = default_input_answer_list;
                              wx.setStorageSync('all', all);
                              break;
                           }
                        }
                        app.globalData.myJueding = true;
                        wx.setStorageSync('switchTab', default_input_answer_list.id);
         
                        if (that.data.flg == 1) {
                           that.setData({
                              flg: 0
                           })
                        }
         
                        wx.showToast({
                           title: '保存成功',
                           icon: 'success',
                           mask: false,
                           success: function () {
                              setTimeout(function () {
                                 wx.switchTab({
                                    url: '../index/index'
                                 })
                              }, 1500)
                           }
                        })
                     }else{
                        //个人决定添加的
                        app.globalData.myJueding = true;
                        wx.setStorageSync('switchTab', default_input_answer_list.id);
                        myJuedin.push(default_input_answer_list);
                        wx.setStorageSync('myJuedin', myJuedin);
                        all.push(default_input_answer_list);
                        wx.setStorageSync('all', all);
                     }
                  }
                  if(!addtype){
                     wx.setStorageSync('num', wx.getStorageSync('num') + 1);
                     that.cloudNum();
                     wx.showToast({
                        title: '保存成功',
                        icon: 'success',
                        mask: false,
                        success: function () {
                           setTimeout(function () {
                              wx.switchTab({
                                 url: '../index/index'
                              })
                           }, 1500)
                        }
                     })
                  }
               }else{
                  wx.showModal({
                     title: '名称或选项存在敏感字符',
                     showCancel:false
                   })
               }
            },
            fail(res){
               wx.showModal({
                  title: '名称或选项存在敏感字符',
                  showCancel:false
                })
            }
         })
      }
   },
   cloudNum(){
      db.collection('num').doc(wx.getStorageSync('num_id')).set({
         data: {
            num:wx.getStorageSync('num')
         },
         success: function(res) {
           console.log(res.data)
         }
       })
   },
   onUnload: function () {
      var that = this, flg = that.data.flg, myJuedin = wx.getStorageSync('myJuedin'), all = wx.getStorageSync('all');

      if (flg == 1) {
         myJuedin.splice(myJuedin.length - 1, 1);
         wx.setStorageSync('myJuedin', myJuedin);
      }

      function rep(arr) {
         var result = [];
         var obj = {};
         for (var i = 0; i < arr.length; i++) {
            if (!obj[arr[i].id]) {
               result.push(arr[i]);
               obj[arr[i].id] = true;
            }
         }
         return result;
      }
      var a = rep(myJuedin), b = rep(all);
      if(!this.data.ifEdit){
         db.collection('jueding').add({
            // data 字段表示需新增的 JSON 数据
            data: {
            //   _id: 'juedingId',
              myJuedin:a
            },
            success: function(res) {
              // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
              console.log(res)
            },
            fail: function(res) {
               // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
               console.log(res)
             }
          })
      }else{
         db.collection('jueding').doc(wx.getStorageSync('jueding_item')._id).set({
            data: {
               myJuedin:a
            },
            success: function(res) {
              console.log(res.data)
            },
            fail: function(res) {
               // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
               console.log(res)
             }
          })
      }
      //wx.setStorageSync('myJuedin', a);
      wx.setStorageSync('all', b);
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