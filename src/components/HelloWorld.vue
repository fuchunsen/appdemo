<template>
  <div class="wrapper">
    <div class="container">
      <p v-on:dblclick="getConfigNum(2)">AKSO HEALTH</p>
      <div class="loading"></div>
      <span>预加载资源文件 ... {{progress}}&nbsp;（{{step}}/4）</span>
    </div>
    <div class="config" :style="showType === 1 ? 'top: -100%' : 'top: 0'">
      <p v-on:dblclick="getConfigNum(1)">设置配置参数</p>
      <div v-on:dblclick="getConfigNum(1)">双击此处 更改参数配置</div>
      <input type="text" :autofocus="true" v-model="idnum" />
    </div>
  </div>
</template>

<script>
    const path = require('path');
    // const fs = require('fs-extra');
    import axios from 'axios';
    var modal = weex.requireModule('modal');
    var storage = weex.requireModule('storage');
    export default {
        name: 'HelloWorld',
        data () {
            return {
                token: '',
                baseurl: 'https://api.lotusdata.com/',
                showType: 1,
                idnum: '',
                step: 1,
                progress: ''
            }
        },
        mounted () {
            if (window.navigator.onLine) {  //有网络清空缓存重新获取数据
                var data = {
                    "username": "kevin.li@yitushijie.com",
                    "password": "123123",
                    "refreshtoken": "0"
                };
                axios.post(this.baseurl + 'v1/buser/token', data, {}).then(res => {
                    if (res.data.code == '0') {
                        var token = 'JWT ' + res.data.token;
                        this.token = token;
                        this.getBaseInfo();
                    }
                })
            } else {  //无网络直接进入
                modal.toast({
                    message: '暂无网络连接',
                    duration: 2
                });
            }
        },
        methods: {
            getConfigNum (num) {
                if (num === 1) {
                    if (this.idnum === '') {
                        this.showType = num;
                        this.getBaseInfo();
                    } else {
                        storage.setItem('idnum', this.idnum, res => {
                            if (res.result === 'success') {
                                this.showType = num;
                                this.getBaseInfo();
                            }
                        })
                    }
                } else {
                    this.idnum = '';
                    this.showType = num;
                }
            },
            getBaseInfo () {  //获取基础数据
                storage.getItem('idnum', res => {
                    if (res.result === 'failed' || res.data === 'undefined' || res.data === '') {
                        modal.toast({
                            message: '请输入设备Id',
                            duration: 2
                        });
                        this.getConfigNum(2);
                    } else {
                        var idnum = res.data;
                        axios.get(this.baseurl + 'eduscreen/v1/screenmanage/deviceconfig/' + idnum, {headers: {Authorization: this.token}}).then(res => {
                            if (res.data.code == '0') {
                                this.global.baseInfo = res.data.data;
                                this.getStaticInfo();
                                this.getDoctorList();
                                this.getMediaList();
                            }
                        })
                    }
                });
            },
            getStaticInfo () {  //获取静态资源
                axios.get(this.baseurl + 'eduscreen/v1/screenmanage/resourcelist/' + this.global.baseInfo.deviceid, {headers: {Authorization: this.token}}).then(res => {
                    if (res.data.code == '0') {
                        this.global.staticInfo = res.data.data;
                        this.step = this.step + 1;
                        if (this.step === 4) {
                            this.downloadStaticInfo();
                        }
                    }
                });
            },
            downloadStaticInfo () {  //下载静态资源
                var baseInfo = this.global.baseInfo,
                    staticInfo = this.global.staticInfo,
                    doctorList = this.global.doctorList,
                    mediaList = this.global.mediaList;
                for (let m in doctorList) {
                    for (let n in staticInfo) {
                        if (staticInfo[n].resourcetype === 'homeQrcode') {
                            baseInfo.homeQrcode = staticInfo[n].resourceurl;
                        }
                        if (doctorList[m].Doctorinfo.Doctorid === staticInfo[n].resourceid && staticInfo[n].resourcetype === 'docQrcode') {
                            doctorList[m].Doctorinfo.Qrcode3 = staticInfo[n].resourceurl;
                        }
                    }
                }
                for (let i in mediaList) {
                    for (let j in staticInfo) {
                        if (mediaList[i].Libraryid === staticInfo[j].resourceid.split('/')[0]) {
                            if (staticInfo[j].resourcetype === 'mediaQrcode') {
                                mediaList[i].sourceQrcode = staticInfo[j].resourceurl;
                            } else if (staticInfo[j].resourcetype === 'media') {
                                mediaList[i].sourceType = staticInfo[j].datatype;
                                mediaList[i].sourceUrl = staticInfo[j].resourceurl;
                            }
                        }
                    }
                }
                this.global.baseInfo = baseInfo;
                this.global.doctorList = doctorList;
                this.global.mediaList = mediaList;
                setInterval(() => {
                    this.$router.push({
                        path: '/content'
                    })
                }, 1000)
                // var staticInfo = this.global.staticInfo;
                // for (let i  = 0; i < staticInfo.length; i++) {
                //     if (i < 5) {
                //         var url = staticInfo[i].resourceurl;
                //         console.log(url);
                //         var eleLink = document.createElement('a');
                //         eleLink.download = 'file';
                //         eleLink.href = url;
                //         eleLink.style.display = 'none';
                //         document.body.appendChild(eleLink);
                //         eleLink.click();
                //         document.body.removeChild(eleLink);
                //     }
                // }
            },
            getDoctorList () {  //获取医生列表
                axios.get(this.baseurl + 'v1/doctor/deptdoctorlist/' + this.global.baseInfo.teamid, {headers: {Authorization: this.token}}).then(res => {
                    if (res.data.code == '0') {
                        this.global.doctorList = res.data.data;
                        this.step = this.step + 1;
                        if (this.step === 4) {
                            this.downloadStaticInfo();
                        }
                    }
                });
            },
            getMediaList () {  //获取媒体库列表
                axios.get(this.baseurl + 'eduscreen/v1/devicemedialibrary/list/' + this.global.baseInfo.deviceid + '?key&start=0&limit=80', {headers: {Authorization: this.token}}).then(res => {
                    if (res.data.code == '0') {
                        var mediaList = res.data.data;
                        this.getMediaDetail(mediaList);
                    }
                });
            },
            async getMediaDetail (list) {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].Dtype === '0') {  //标准库
                        await axios.get(this.baseurl + 'eduscreen/v1/mediastandardlibrary/librarydetailshow/' + list[i].Libraryid, {headers: {Authorization: this.token}}).then(res => {
                            if (res.data.code == '0') {
                                list[i].child = res.data.data;
                                if (i === list.length - 1) {
                                    this.step = this.step + 1;
                                    this.global.mediaList = list;
                                    if (this.step === 4) {
                                        this.downloadStaticInfo();
                                    }
                                }
                            }
                        });
                    } else if (list[i].Dtype === '1') {  //素材库
                        await axios.get(this.baseurl + 'eduscreen/v1/materiallibrary/librarydetailshow/' + list[i].Libraryid, {headers: {Authorization: this.token}}).then(res => {
                            if (res.data.code == '0') {
                                list[i].child = res.data.data;
                                if (i === list.length - 1) {
                                    this.step = this.step + 1;
                                    this.global.mediaList = list;
                                    if (this.step === 4) {
                                        this.downloadStaticInfo();
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }
    }
</script>

<style lang="less" scoped>
  .wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    .container {
      width: 100%;
      height: 100%;
      background-color: #323232;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      p {
        color: #161a1d;
        font-size: 50px;
        font-weight: bold;
        font-family: "Adobe Hebrew";
        padding: 50px;
      }
      .loading {
        width: 80px;
        height: 80px;
        background: url('/static/image/loading.png') no-repeat center center /cover;
        position: absolute;
        bottom: 90px;
        left: 50%;
        animation: loadingRotate 2s linear 0s infinite normal forwards;
      }
      span {
        color: #707273;
        font-size: 20px;
        position: absolute;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
    .config {
      width: 100%;
      height: 100%;
      background-color: #323232;
      position: absolute;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: top 0.5s;
      p {
        width: 100%;
        text-align: center;
        font-size: 50px;
        color: #ccc;
        position: absolute;
        left: 0;
        top: 20px;
      }
      div {
        width: 100%;
        text-align: center;
        font-size: 30px;
        color: #999;
        position: absolute;
        left: 0;
        top: 90px;
      }
      input {
        width: 50%;
        height: 50px;
        background-color: #323232;
        border-bottom: 2px solid #ccc;
        color: #eee;
        font-size: 40px;
        outline: none;
      }
    }
  }

  @keyframes loadingRotate {
    0% {
      transform: translateX(-50%) rotate(0deg);
    }
    100% {
      transform: translateX(-50%) rotate(360deg);
    }
  }
</style>
