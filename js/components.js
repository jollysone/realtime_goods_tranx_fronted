Vue.component('nav-header', {
    props: ['page'],
    data: function () {
        return {
            loading: true,
            user: {}
        }
    },
    mounted: function () {
        let token = _getStorageStr('token');
        let self = this;
        if (token) {
            let user = _getStorageObj('user', {});
            self.user = user;
            if (user.id) {
                self.loading = false;
            }
            _api('get', 'user/current', {}, function (res) {
                if (res.success) {
                    let user = res.data;
                    self.user = user;
                    _save('user', user);
                } else {
                    _remove('token');
                }
                self.loading = false;
            });
        } else {
            self.loading = false;
        }
    },
    template: `<section>
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <nav class="navbar navbar-expand-lg  navigation">
                        <a class="navbar-brand" href="index.html">
                            <img src="images/logo.png" alt="">
                        </a>
                        <button class="navbar-toggler" type="button" data-toggle="collapse"
                                data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul class="navbar-nav ml-auto main-nav ">
                                <li class="nav-item" :class="{active: page=='index'}">
                                    <a class="nav-link" href="index.html">首页</a>
                                </li>
                                <li class="nav-item" :class="{active: page=='list'}">
                                    <a class="nav-link" href="list.html">物品</a>
                                </li>
                            </ul>
                            <ul v-if="!loading" class="navbar-nav ml-auto mt-10">
                                <li v-if="!user.id" class="nav-item">
                                    <a class="nav-link login-button" href="login.html">登录</a>
                                </li>
                                <li v-if="user.id" class="nav-item">
                                    <a class="nav-link login-button" href="user-goods.html">{{user.nick?user.nick:user.phone}}</a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    </section>`
});

Vue.component('page-footer', {
    props: [],
    data: function () {
        return {}
    },
    template: `<footer class="footer-bottom">
        <div class="container">
            <div class="row">
                <div class="col-sm-6 col-12">
                    <div class="copyright">
                        <p>Copyright © 2019</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="top-to">
            <a id="top" class="" href=""><i class="fa fa-angle-up"></i></a>
        </div>
    </footer>`
});

Vue.component('user-sidebar', {
    props: ['page'],
    data: function () {
        return {
            loading: true,
            user: {}
        }
    },
    mounted: function () {
        let self = this;
        let user = _getStorageObj('user', {});
        self.user = user;
        if (user.id) {
            self.loading = false;
        }
        _api('get', 'user/current', {}, function (res) {
            if (res.success) {
                let user = res.data;
                self.user = user;
                _save('user', user);
            } else {
                _remove('token');
                _remove('user');
                _relocation('index.html')
            }
            self.loading = false;
        });
    },
    methods: {
        onClickLogout: function () {
            _remove('token');
            _remove('user');
            _relocation('index.html')
        }
    },
    template: `<div class="col-md-10 offset-md-1 col-lg-4 offset-lg-0">
    <div class="sidebar">
        <div class="widget user-dashboard-menu">
            <ul>
                <li :class="{active: page=='user-goods'}">
                    <a href="user-goods.html"><i class="fa fa-file-archive-o"></i>我的商品</a>
                </li>
                <li :class="{active: page=='user-orders'}">
                    <a href="user-orders.html"><i class="fa fa-bookmark-o"></i>买入订单</a>
                </li>
                <li :class="{active: page=='user-sell-orders'}">
                    <a href="user-sell-orders.html"><i class="fa fa-bookmark-o"></i>卖出订单</a>
                </li>
                <li :class="{active: page=='user-profile'}">
                    <a href="user-profile.html"><i class="fa fa-user"></i>我的资料</a>
                </li>
                <li>
                    <a href="javascript:;" @click="onClickLogout"><i class="fa fa-cog"></i>退出登录</a>
                </li>
            </ul>
        </div>
    </div>
</div>`
});