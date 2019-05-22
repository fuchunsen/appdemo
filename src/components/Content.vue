<style lang="less" scoped>
    .container {
        width: 100%;
        height: 100%;
        background-color: #fff;
    }
    .docModule {
        width: 100%;
        height: 100%;
        padding: 100px 5% 5%;
        box-sizing: border-box;
        flex-direction: row;
        justify-content: space-between;
        position: relative;
        .title {
            width: 100%;
            background-color: #4051b2;
            padding: 0 10px;
            box-sizing: border-box;
            flex-direction: row;
            justify-content: space-between;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 99999;
            p {
                color: #fff;
                font-size: 30px;
                line-height: 80px;
            }
        }
        .doctorInfo {
            width: 31%;
            height: 100%;
            border: 1px solid #ccc;
            background-color: #fff;
            transition: all .5s ease;
            box-sizing: border-box;
            align-items: center;
            justify-content: space-around;
            .docImage {
                width: 80%;
                height: 50%;
                background-repeat: no-repeat;
                background-position: center center;
                background-size: contain;
            }
            .docInfo {
                width: 100%;
                height: 30%;
                padding: 0 5%;
                box-sizing: border-box;
                flex-direction: row;
                justify-content: space-between;
                .name {
                    width: 48%;
                    height: 100%;
                    p:first-child {
                        font-size: 40px;
                        font-weight: bold;
                        color: #333;
                    }
                    p:last-child {
                        font-size: 36px;
                        color: #666;
                        margin-top: 20px;
                    }
                }
                .qrcode {
                    width: 48%;
                    height: 100%;
                    background-repeat: no-repeat;
                    background-position: center center;
                    background-size: contain;
                }
            }
        }
    }
    .picModule {
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;
        position: relative;
        figure {
            width: 180px;
            height: 180px;
            position: absolute;
            right: 22%;
            top: 5%;
        }
    }
    .vioModule {
        width: 100%;
        height: 100%;
        background-color: #000;
        justify-content: center;
        align-items: center;
        position: relative;
        video {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 5;
        }
        div {
            width: 40%;
            align-items: center;
            figure {
                width: 225px;
                height: 225px;
            }
            p {
                font-size: 30px;
                color: #fff;
                margin-top: 20px;
            }
        }
    }
    .homeQrcode {
        width: 180px;
        height: 180px;
        position: fixed;
        right: 5%;
        top: 5%;
        z-index: 9;
    }
</style>

<template>
    <div class="container">
        <!--医生名片模板-->
        <div v-show="moduleNum === '0' || moduleNum === '1'" class="docModule">
            <div class="title">
                <text>{{baseInfo.name}}</text>
                <text>{{time}}</text>
            </div>
            <div class="doctorInfo" v-for="(item, index) in showDoc" :key="item.Doctorinfo.Doctorid" :style="moduleNum === '1' ? 'transform: translateY(0);transition-delay: ' + (index * 0.3) + 's' : 'transform: translateY(-110%);transition-delay: ' + (index * 0.3) + 's'">
                <div class="docImage" :style="'background-image: url(' + item.Doctorinfo.Idphoto + ');'"></div>
                <div class="docInfo">
                    <div class="name">
                        <text>{{item.Doctorinfo.Name}}</text>
                        <text>{{item.Doctorinfo.Titlename}}</text>
                    </div>
                    <div class="qrcode" :style="'background-image: url(' + item.Doctorinfo.Qrcode3 + ');'"></div>
                </div>
            </div>
        </div>
        <!--图片宣教模板-->
        <div v-show="moduleNum === '2'" class="picModule" :style="'background-image: url(' + showKnowledge.sourceUrl + ');'">
            <image :src="showKnowledge.sourceQrcode" />
        </div>
        <!--视频宣教模板-->
        <div v-show="moduleNum === '3'" class="vioModule">
            <video width="100%" height="100%" :controls="false" :autoplay="true" :src="showKnowledge.sourceUrl" id="videoplay" @timeupdate="videoPlaying" @canplay="videoCanplay" v-if="showVideo"></video>
            <div>
                <image :src="showKnowledge.sourceQrcode" />
                <text>微信扫码查看完整内容</text>
            </div>
        </div>
        <!--科室二维码-->
        <image class="homeQrcode" :src="baseInfo.homeQrcode" v-show="moduleNum === '2' || moduleNum === '3'" />
    </div>
</template>

<script>
    export default {
        name: "Content",
        data () {
            return {
                moduleNum: '0',
                time: '',
                timefunc: '',
                baseInfo: {},
                doctorList: [],
                mediaList: [],
                showDoc: [],
                showKnowledge: {},
                showVideo: true,
                duration: 1,
                page: 0,
                knowPage: 0
            }
        },
        mounted () {
            var that = this;
            this.baseInfo = this.global.baseInfo;
            for (let i = 0; i < this.baseInfo.modulenum; i++) {
                this.doctorList = this.doctorList.concat(this.global.doctorList);
                this.mediaList = this.mediaList.concat(this.global.mediaList);
            }
            if (this.doctorList.length % 3 === 1) {
                this.doctorList.push(this.doctorList[0]);
                this.doctorList.push(this.doctorList[1]);
            } else if (this.doctorList.length % 3 === 2) {
                this.doctorList.push(this.doctorList[0]);
            }
            this.doctorDisplay();
            getNowTime();
            function getNowTime () {
                var date = new Date(),
                    hours = date.getHours(),
                    minites = date.getMinutes();
                that.time = (date.getMonth() + 1) + '月' + date.getDate() + '日 ' + (hours < 10 ? '0' + hours : hours) +":"+ (minites < 10 ? '0' + minites : minites);
            }
            this.timefunc = setInterval(getNowTime, 1000);
        },
        beforeDestroy () {
            clearInterval(this.timefunc);
        },
        methods: {
            doctorDisplay () {
                var that = this,
                    page = 0,
                    docPage = parseInt(that.doctorList.length / 3);
                run();
                function run () {
                    that.showDoc = that.doctorList.slice(page * 3, page * 3 + 3);
                    setTimeout(() => { that.moduleNum = '1'; }, 200);
                    setTimeout(() => {
                        that.moduleNum = '0';
                        if (++page < docPage) { run(); }
                        else { that.knowledgeDisplay(); }
                    }, that.baseInfo.doctornum * 1000)
                }
            },
            knowledgeDisplay () {
                this.page = 0;
                this.knowPage = Math.ceil(this.mediaList.length / 6);
                this.go();
            },
            go () {
                var that = this,
                    page = that.page,
                    knowPage = that.knowPage,
                    arr = that.mediaList.slice(page * 6, page * 6 + 6),
                    num = Math.floor(Math.random() * arr.length);
                that.showKnowledge = arr[num];
                if (arr[num].sourceType === 'video') {
                    that.showVideo = true;
                    that.moduleNum = '3';
                    that.page = ++page;
                } else {
                    that.moduleNum = '2';
                    setTimeout(() => {
                        that.page = ++page;
                        if (that.page < knowPage) { go(); }
                        else {
                            that.moduleNum = '0';
                            that.doctorDisplay();
                        }
                    }, that.baseInfo.edunum * 1000)
                }
            },
            videoPlaying () {
                var video = document.getElementById('videoplay');
                if (video.currentTime >= this.baseInfo.videonum || video.currentTime >= this.duration - 0.5) {
                    video.pause();
                    this.showVideo = false;
                    setTimeout(() => {
                        if (this.page < this.knowPage) {
                            this.go();
                        } else {
                            this.moduleNum = '0';
                            this.doctorDisplay();
                        }
                    }, 10000);
                }
            },
            videoCanplay () {
                var video = document.getElementById('videoplay');
                video.play();
                this.duration = video.duration;
            }
        }
    }
</script>
