<template>
    <el-header class="header">
        <h1>信息管理系统</h1>
    </el-header>
    <div class="login-wrap">

        <div class="ms-login">
            <el-menu class="menu-div" mode="horizontal" default-active="1" :ellipsis="false" background-color=" #CAE7F6" >
                <el-menu-item  index="1" class="ms-title" style="flex: 1;">登录</el-menu-item>
                <el-menu-item  index="2" class="ms-title1" style="flex: 1">注册</el-menu-item>
            </el-menu>
            <el-form :model="param" :rules="rules" ref="login" label-width="0px" class="ms-content">
                <el-form-item prop="username">
                    <el-input v-model="param.username" placeholder="username">
                        <template #prepend>
                            <el-button :icon="User"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="password" v-model="param.password">
                        <template #prepend>
                            <el-button :icon="Lock"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="checkCode">
                    <div class="login-code-form">
                        <el-input type="text" placeholder="验证码" v-model="param.checkCode"
                            @keyup.enter="submitForm(login)" style="width: 60%;">
                            <!-- <template #prepend>
                            <el-button :icon="Message"></el-button>
                        </template> -->
                        </el-input>
                        <a href="javascript:void(0)" @click="createCode()"><img :src="verifitycode" alt="图片加载失败" /></a>
                    </div>

                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm(login)">登录</el-button>
                </div>
                <el-checkbox class="login-tips" v-model="checked" label="记住密码" size="large" />
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useTagsStore } from '../store/tags';
import { usePermissStore } from '../store/permiss';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Lock, User } from '@element-plus/icons-vue';
import axios from 'axios';
interface LoginInfo {
    username: string;
    password: string;
    checkCode: string;
}

//注意这一部分就是记住登录的内容；
const lgStr = localStorage.getItem('login-param');
const defParam = lgStr ? JSON.parse(lgStr) : null;
const checked = ref(lgStr ? true : false);
const router = useRouter();
const verifitycode = ref('');
//登录参数；
const param = reactive<LoginInfo>({
    username: defParam ? defParam.username : '',
    password: defParam ? defParam.password : '',
    checkCode: '',
});
//登录表单；
const login = ref<FormInstance>();
const permiss = usePermissStore();

onMounted(() => {
    createCode();
});
const rules: FormRules = {
    username: [
        {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
        },
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};


//登录请求；
const submitFormResult = () => {
    axios.post('user/login/login', param).then(res => {
        if (res.data.code === 200) {
            localStorage.setItem('token', res.data.token);
            ElMessage.success('登录成功');
            localStorage.setItem('ms_username', param.username);
            const keys = permiss.defaultList[param.username == 'admin' ? 'admin' : 'user'];
            permiss.handleSet(keys);
            localStorage.setItem('ms_keys', JSON.stringify(keys));
            router.push('/');
            //记住密码；
            if (checked.value) {
                localStorage.setItem('login-param', JSON.stringify(param));
            } else {
                localStorage.removeItem('login-param');
            }
        } else {
            ElMessage.error(res.data.message);
            createCode();
        }
    })
        .catch(err => {
            return false;
        })
}
const createCode = () => {
    //二进制方式读取图片流  验证码
    axios
        .get("user/login/getCode", {
            responseType: "arraybuffer"
        })
        .then(response => {
            return (
                "data:image/png;base64," +
                btoa(
                    new Uint8Array(response.data).reduce(
                        (data, byte) => data + String.fromCharCode(byte), ""
                    )
                )
            );
        })
        .then(data => {
            verifitycode.value = data;

        });
}

//element-plus的form表单验证；
const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.validate((valid: boolean) => {
        if (valid) {
            submitFormResult();
        } else {
            ElMessage.error("请填写完整信息");
            createCode();
            return false;
        }
        createCode();
    });
};

const tags = useTagsStore();
tags.clearTags();
</script>

<style scoped>
.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 70px;
    font-size: 22px;

    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #02112E;
}

h1 {
    font-family: 'Roboto', sans-serif;
    font-size: 35px;
    color: #767C7C;
    padding: 20px;
    border-radius: 10px;
    text-align: center;

    animation: fadeIn 3s ease-out forwards;
    opacity: 0;
    height: 50px;
    width: 20%;
    letter-spacing: 10px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.login-wrap {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-image: url(../assets/img/login-bg.jpg);
    background-size: 100%;
}

.menu-div {
    border-radius:15px 15px 0 0;
    border: #25262F;
    width: 100%;
    margin-bottom: 7%;
   
}


.ms-title {
    font-family: Arial, Helvetica, sans-serif;
    background-color: RGB(254, 244, 242,0.5);
    border: 1px solid #aeaec7;
    color: #858383;
    border-radius:15px 0 0 0;
    line-height: 40px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    padding-top: 10px;
    letter-spacing: 20px;
}


.ms-title1 {
    font-family: Arial, Helvetica, sans-serif;
    background-color:  RGB(254, 244, 242,0.5);
    border: 1px solid#aeaec7;
    color: #858383;
    border-radius:0 15px 0 0;
    line-height: 40px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    padding-top: 10px;
    letter-spacing: 20px;
}

.ms-login {
    margin-top: 7%;
    width: 360px;
    height: 350px;
    border-radius: 20px;
    background-image: url(../assets/img/login-form.jpg);
    background-size: 100%;
}

.ms-content {
    padding: 10px 30px 30px;
}

.login-btn {
    text-align: center;
}

.login-btn button {
    width: 100%;
    height: 36px;
    margin-bottom: 10px;
}

.login-tips {
    font-size: 12px;
    line-height: 30px;
    color: #faf1f1;
}

.login-code-form {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 10px;
}
</style>
