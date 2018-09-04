// pages/homepages/homepages.js
var appInstance = getApp()


Page({
  /**
   * 页面的初始数据
   */
  data: {
    animationData: {},
    popup: "",    // 网络请求存储进球的信息
    tempPopUp: new Object,   // 存储进球的信息， 初始值为空对象
    banner: "",
    progress: "",
    collect: new Array(),
    scrolled: false,
    title: ["全部", "进行中", "赛程", "赛果", "关注"],
    id: null,
    currentTab: 0,
    intervalId: "",
    minute: "",     //显示给用户看的时间//这个变量没有用  因为每一场比赛都不同
    checkTime: "",      //计时器判断使用的时间//这个变量没有用  因为每一场比赛都不同  //auther kechunlin
    refreshMatchTimeIntervalID: 0, //刷新比赛时间的计时器
    toView:"to00"

  },
  update_match_datas:function(matchDatas) {

    for (var index in matchDatas) {

      //每一场比赛都需要有计时的变量

      if (typeof (matchDatas[index]) == 'object'){

        var showValues = this.convertMatchTime(matchDatas[index].start_time, matchDatas[index].status, matchDatas[index].checkTime, matchDatas[index].stateTime)
        matchDatas[index].minute = showValues[0]
        //找到 最上面一条  未开始的比赛

        if ((matchDatas[index].minute != '完') && (this.data.toView == 'to00')) {

          this.data.toView = "to" + matchDatas[index].game_num
        }

        //
        matchDatas[index].checkTime = showValues[1]

      }

    }
  },

  refreshMatchTime: function (isSetData, matchDatas,isBanner,onlyProgress) {
    var that = this
    //更新两组数据,bnnaer,progress
    this.update_match_datas(this.data.progress)

    if (onlyProgress)
    {


    }else{
      this.update_match_datas(this.data.banner)

    }


    if (matchDatas == undefined) {
      this.setData({
        banner: this.data.banner,
        progress: this.data.progress
    })
    }
  },
  //auther kechunlin
  //根据比赛状态和比赛时间，返回比赛进行的时间
  //给计算看的比赛时间
  convertMatchTime: function (matchStartTime, matchState, cTime, matchDate) {
    var showValues = new Array()
    var showStateValue = ''

    //matchState  长期在客户端没有更新的情况下
    // 实际时间 - 比赛时间 的差值 ，


    var marking = 0    //0代表比赛已经开始了，-1 代表比赛未开始
    var delta_time = 0 //-数未开始，比赛进行了多少时间

    if (matchState == 'COMPLETE') {

      marking = -1


    } else if (matchState == 'NO_START') {

      marking = 1

    }else{

      var markingArray = this.get_delta_time(matchDate)
      marking = markingArray[0]    //0代表比赛已经开始了，-1 代表比赛未开始
      delta_time = markingArray[1] //-数未开始，比赛进行了多少时间

    }
    if (marking == 0){

      if( delta_time > 0 && matchState == 'NO_START'){

        matchState = 'START'

      }


      if (cTime == undefined) {

        if (delta_time > 0){

          cTime = delta_time
          if (matchState == 'HALF_START') {
            cTime = delta_time + 45
          }

        }else{
          cTime = 0
        }

      }

      if (matchState == 'NO_START') {

        showStateValue = '未'
        cTime = 0

      } else if (matchState == 'START') {

        cTime += 1
        showStateValue = cTime

        if (cTime > 45) {

          this.request_total_match(false)

        }

      } else if (matchState == 'HALF_END') {//接口暂时没有返回此值，先假设

        showStateValue = '中'
        cTime = 45


      } else if (matchState == 'HALF_START') {//接口暂时没有返回此值，先假设

        cTime += 1
        showStateValue = cTime
        if (cTime > 90) {

          //showStateValue = '90+'
          this.request_total_match(false)
        }

      } else if (matchState == 'COMPLETE') {

        showStateValue = '完'
        cTime = 90
      }
    }else if (marking == 1) {

      showStateValue = '未'
      cTime = 0

    }else {

      showStateValue = '完'
      cTime = 0
    }

    showValues.push(showStateValue, cTime)

    return showValues
  },

 // 获取当前时间与比赛时间的时间差
 //正数，表示比赛进行了多少时间
 //负数，表示比赛 还有多少时间进行

  get_delta_time: function(matchDate) {
    var marking = new Number()
    var markingArray = new Array()

    if (matchDate != 0 || matchDate == undefined) {

      // 当前的时间
      var date = new Date()
      // var nowMonth = date.getMonth() + 1
      // var nowDay = date.getDate()
      var nowHour = date.getHours()
      var nowMinute = date.getMinutes()
      if (nowHour == 0) {
        nowHour = 24
      }

      // 比赛状态的时间
      var matchDateList = matchDate.split("-")
      // var matchMonth = parseInt(matchDateList[1])
      var matchList = matchDateList[2].split(" ")

      // var matchDay = parseInt(matchList[0])
      var startTimeList = matchList[1].split(":")
      var matchHour = parseInt(startTimeList[0])
      var matchMinute = parseInt(startTimeList[1])
      if (matchHour == 0) {
        matchHour = 24
      }

      var deltaMinute = nowMinute - matchMinute
      var deltaHour = nowHour - matchHour
      var deltaTime = deltaHour * 60 + deltaMinute
      if (deltaTime >= 0 ){
        marking = 0
      }
      else {
        marking = 1
      }

      markingArray.push(marking, deltaTime)
      return markingArray
    } else{
      return [-1, 0]
    }

  },
  // 从数据库中取数据，赋值给tempPopUp
  // 退出进程在进入的时候， 不会弹框
  // getPopUpInfo: function () {
  //   var popUpInfo = wx.getStorageSync("popUp_info")
  //   this.data.tempPopUp = popUpInfo
  // },
  matchFavorite: function () {
    var info = wx.getStorageSync("collect")

    if (info.length > 0) {

      //this.setData({ collect: info })
      this.data.collect = info

      var banner = this.data.banner

      for (var index in banner) {
        for (var i in info) {
          if (banner[index].game_num === info[i].game_num) {
            banner[index].star = "../images/star_red.png"
            break
          }
          else {
            banner[index].star = "../images/star_gray.png"
          }
        }
      }
      if (this.data.progress !== "107"){
        var progress = this.data.progress
        for (var numbers in progress) {
          for (var n in info) {
            if (progress[numbers].game_num === info[n].game_num) {
              progress[numbers].star = "../images/star_red.png"
              break
            }
            else {
              progress[numbers].star = "../images/star_gray.png"
            }
          }
        }
      }

    }

    else {
      var banner = this.data.banner
      for (var index in banner) {
        banner[index].star = "../images/star_gray.png"
      }
      if (this.data.progress !== "107"){
        var progress = this.data.progress
        for (var numbers in progress) {
          progress[numbers].star = "../images/star_gray.png"

        }
      }

    }


  },
  //找到banner里面某一场比赛，并将这场比赛的所有信息替换掉
  replace_match: function (game_num, home_score, away_score) {

    for(var index in this.data.banner){
      if (this.data.banner[index].game_num == game_num){
        this.data.banner[index].home_score = home_score
        this.data.banner[index].away_score = away_score

        break
      }

    }
  },

  requestPopData: function () {
    var that = this;
    // 弹窗的接口请求
    wx.request({
      url: appInstance.globalData.URL + 'pop_up/windows/v1.0',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded",
      },
      success: (e) => {
        if (e.data.code == 100) {

          // 请求回来的数据与tempPopUp做比较， 如果值不同，就弹窗，再将值存在Storage


            if ((that.data.popup.game_num !== e.data.data.game_num || that.data.popup.event_time !== e.data.data.event_time ||that.data.popup.event_team !== e.data.data.event_team)) {
              //更新banner，并更新UI

              this.replace_match(e.data.data.game_num, e.data.data.home_score, e.data.data.away_score)

              this.popupWindows()

              this.setData({
                banner: this.data.banner,
                popup: e.data.data
              })

            }

        }
      },
      fail: function (e) {
        that.data.popup = '101'
      }
    })

  },
  init_banner_data:function(){

    this.setData({
      banner: [{ "competition": "\u4e16\u754c\u676f", "time": "06-14 23:37", "home_team": "\u4fc4\u7f57\u65af", "home_team_score": "5", "away_team": "\u6c99\u7279\u963f\u62c9\u4f2f", "away_team_score": "0", "game_num": "1", "status": "COMPLETE", "match_id": "2306734", "start_time": "23:00", "date_time": "06-14 23:00", "company": "Bet365", "odds_type": "asia", "odds": { "firsthomeodds": "0.86", "firstdraw": "\u534a/\u4e00", "firstawayodds": "0.87", "homeodds": "1.03", "draw": "\u534a/\u4e00", "awayodds": "0.87" }, "first_time": "2018-06-14 23:37", "event": ["Goal"], "minute": 0, "home_first_yellow_card": 0, "away_first_yellow_card": 0, "home_first_red_card": 0, "away_first_red_card": 0, "home_first_score": 2, "away_first_score": 0, "home_second_score": 3, "away_second_score": 0, "home_second_yellow_card": 1, "away_second_yellow_card": 1, "home_second_red_card": 0, "away_second_red_card": 0, "team": "home_team", "event_time": "90+4'", "session": "2nd Half", "name": ["Golovin A."], "str_time": 1529144752.6103644, "home_score": 5, "away_score": 0, "home_red_card": 0, "home_yellow_card": 1, "away_red_card": 0, "away_yellow_card": 1, "home_half_score": 2, "away_half_score": 0 }]
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init_banner_data()

    //第一次请求全部数据，banner的值得到更新
    this.request_total_match(false)
  },


  /**
   * 生命周期函数--监听页面显示
   */
  popupWindows: function () {
    if (this.animation == undefined) {
      var animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
      })

      this.animation = animation
    }

    this.animation.translate(0, 0).step({ timingFunction: 'ease' })
    this.animation.translate(0, -280).step({ duration: 500 })

    this.animation.translate(0, 10).step({ duration: 2000, delay: 500 })

    this.setData({
      animationData: this.animation.export()
    })

  },

  onShow: function () {

    this.data.intervalId = setInterval(this.requestPopData, 2000)
    //auther kechunlin
    //启动1分钟刷新比赛进行的时间
    this.data.refreshMatchTimeIntervalID = setInterval(this.refreshMatchTime, 60000)

    //setTimeout(this.delay_start_refreshMatch,30000)

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.intervalId)
    //auther kechunlin
    clearInterval(this.data.refreshMatchTimeIntervalID)

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.intervalId)
    clearInterval(this.data.refreshMatchTimeIntervalID)
  },

  changescroll: function () {
    this.setData({
      scrolled: false
    })
  },
  update_banner_ui:function () {

    //修改星星状态
    this.matchFavorite()
    //修改比赛进行的时间
    this.refreshMatchTime(false,this.data.banner,true)

    //刷新界面
    this.setData({
      banner: this.data.banner,
      toView:this.data.toView,
      //progress: this.data.progress,
      // scrolled:false
    })
  },

  //请求全部赛事数据
  request_total_match: function (isPUll) {
    if (this.data.scrolled) {
      return
    }
    var that = this
    wx.request({
      url: appInstance.globalData.URL + 'total/match/v1.0',
      method: "POST",
      data: {
        "appID":"2018071101",
        appVersion: '1.1'
      },
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "app-version":"1.0"
      },
      success: (e) => {
        if (e.data.code == 100) {
          console.log("全部",e.data.data)
          //增加灰星星属性
          for (var index in e.data.data) {
            e.data.data[index].star = "../images/star_gray.png"
            var times = e.data.data[index].date_time.split("2018-")
            e.data.data[index].date_time = times[1]

          }

          this.data.banner = e.data.data

        }
        else if (e.data.code == 107) {

          this.data.banner = '107'

        }
        else if (e.data.code == 99) {
          this.data.banner = '99'
        }

        var checked = e.data.checked
        wx.setStorage({
          key: "checked",
          data: checked
        })

        //更新数据，更新界面
        if (isPUll){
          this.update_banner_ui_pull()

        }else{
          this.update_banner_ui()
        }
      },
      fail: function (e) {
        that.setData({
          banner :'101',
          // scrolled:false
        })
        //更新数据，更新界面
        if (isPUll) {
          this.update_banner_ui_pull()
        } else {
          that.update_banner_ui()
        }
      },

    })
    this.setData({
      scrolled: true
    })
    setTimeout(this.changescroll,1500)

  },
  update_banner_ui_pull:function () {

    //并修改星星状态
    this.matchFavorite()
    this.update_match_datas(this.data.banner)


    //修改比赛进行的时间
    this.refreshMatchTime(false,this.data.banner,true)
    //刷新界面
    this.setData({
      banner: this.data.banner,
      toView: this.data.toView,
      //progress: this.data.progress,
      // scrolled:false

    })

  },

  banner_scrolltoupper: function (e) {

    //请求全部数据，banner的值得到更新
    this.request_total_match(true)



  },

  update_progress_ui:function(isPull){


    //修改比赛进行的时间
    this.refreshMatchTime(false,this.data.progress,false,true)

    if (isPull) {
      this.setData({
        progress: this.data.progress,
        // scrolled: false
      })

    } else {
      this.setData({
        progress: this.data.progress
      })
    }
  },

  get_progress_match_data: function (isPull) {
    if (this.data.scrolled){
      return
    }

    if (isPull == undefined){
      isPull = true
    }
    var that = this;
    wx.request({
      url: appInstance.globalData.URL + 'progress/match/v1.0',
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded",
      },
      success: (e) => {

        if (e.data.code == 100) {
          for (var index in e.data.data) {
            e.data.data[index].star = "../images/star_gray.png"
          }

          this.data.progress = e.data.data
          this.matchFavorite()

        }
        else if (e.data.code == 107) {
          this.data.progress = e.data.code

        }
        else if (e.data.code == 99) {
          this.data.progress = e.data.code
        }
        //更新界面
        this.update_progress_ui(isPull)

      },
      fail: function (e) {

        that.setData({
          progress:"101",
          // scrolled:false
        })
        //更新界面
        this.update_progress_ui(isPull)

      },
      // complete: function (e) {
      //
      // }
    })
    if (isPull){
      this.setData({
        scrolled:true
      })
      setTimeout(this.changescroll,1500)
    }

  },

  navbarTap: function (e) {
    var that = this
    var name = e.currentTarget.dataset.name
    if (name == "赛程") {
      wx.navigateTo({
        url: '../schedule/schedule',
      })
    }
    else if (name == "赛果") {
      wx.navigateTo({
        url: '../result/result',
      })
    }
    else {

      if (name == "全部") {

        that.matchFavorite()

        this.setData({

          currentTab: e.currentTarget.dataset.idx,

          banner: this.data.banner,

        })
      } else if (name == "进行中"){
        this.setData({
          currentTab: e.currentTarget.dataset.idx,

        })
        this.get_progress_match_data(false)
      }else {

        this.setData({
          currentTab: e.currentTarget.dataset.idx,
          collect:this.data.collect

        })
      }
    }
  },
  changephoto: function (e) {
    var imageId = e.currentTarget.id;

    if (this.data.banner[imageId].star == "../images/star_gray.png") {
      this.data.banner[imageId].star = "../images/star_red.png";

      try {
        this.data.collect.push(this.data.banner[imageId])
        wx.setStorageSync('collect', this.data.collect)
      } catch (e) {

      }

    }
    else if (this.data.banner[imageId].star == "../images/star_red.png") {
      this.data.banner[imageId].star = "../images/star_gray.png";
      try {
        var collects = this.data.collect
        for (var index in collects) {
          if (collects[index].game_num === this.data.banner[imageId].game_num) {
            collects.splice(index, 1)
          }
          wx.setStorageSync("collect", collects)
        }
      } catch (e) {

      }
    }
    this.setData({ banner: this.data.banner })
  },
  progress_changephoto: function (e) {
    var imageId = e.currentTarget.id;
    var collects = this.data.collect
    if (this.data.progress[imageId].star == "../images/star_gray.png") {
      this.data.progress[imageId].star = "../images/star_red.png";
      collects.push(this.data.progress[imageId])
      wx.setStorageSync("collect", collects)
    }
    else if (this.data.progress[imageId].star == "../images/star_red.png") {
      this.data.progress[imageId].star = "../images/star_gray.png";
      for (var index in collects) {
        if (collects[index].game_num === this.data.progress[imageId].game_num) {
          collects.splice(index, 1)
        }
        wx.setStorageSync("collect", collects)
      }
    }
    this.setData({
      progress: this.data.progress,
      collect: collects
    })
  },
  collect_changephoto: function (e) {
    var imageId = e.currentTarget.id;
    try {
      var collects = this.data.collect
      for (var index in collects) {
        if (collects[index].game_num === this.data.collect[imageId].game_num) {
          collects.splice(index, 1)
        }
        wx.setStorageSync("collect", collects)
      }
    } catch (e) {

    }
    this.setData({
      collect: collects,

    })
  },
  jumpodds: function (e) {
    try {
      var value = wx.getStorageSync('checked')
      if (value == 1) {
        return
      }
    } catch (e) {
      // Do something when catch error

    }

    wx.navigateTo({
      url: '../odds/odds?id=' + this.data.banner[e.currentTarget.id].game_num
    })
  },
  progressToOdds: function (e) {
    try {
      var value = wx.getStorageSync('checked')
      if (value == 1) {
        return
      }
    } catch (e) {
      // Do something when catch error

    }
    wx.navigateTo({
      url: '../odds/odds?id=' + this.data.progress[e.currentTarget.id].game_num
    })
  },
  attentionToOdds: function (e) {
    try {
      var value = wx.getStorageSync('checked')
      if (value == 1) {
        return
      }
    } catch (e) {
      // Do something when catch error

    }
    wx.navigateTo({
      url: '../odds/odds?id=' + this.data.collect[e.currentTarget.id].game_num
    })
  }
})
