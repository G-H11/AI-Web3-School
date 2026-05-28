# Windows下Hermes Agent安装部署的笔记

前提：确认电脑BIOS/UEFI的硬件虚拟化功能打开，以及Windows 功能中， “**Hyper-V**”、“**虚拟机平台**”、“**Windows 虚拟机监控程序平台**”和“**适用于Linux的Windows子系统**”已勾选，具体操作及检查可询问AI。

## **WSL环境搭建**

1. 以管理员身份运行 PowerShell：(这步是搭建失败后**重置 WSL 组件，清除残留配置，可从3开始**)
    
    ```
    wsl --shutdown
    dism.exe /online /disable-feature /featurename:Microsoft-Windows-Subsystem-Linux /norestart
    dism.exe /online /disable-feature /featurename:VirtualMachinePlatform /norestart
    ```
    
2. **重启电脑**。
3. 重新开启功能：
    
    ```
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
    ```
    
4. **再次重启**。
5. 安装 WSL 并设置默认版本：
    
    ```
    wsl --install --no-distribution
    wsl --set-default-version 2
    ```
    
6. 最后安装 Ubuntu：
    
    ```
    wsl --install -d Ubuntu-24.04
    ```
    

## **将 WSL 移动到非系统盘(系统盘空间不足情况下食用)**

1. 检查当前系统路径

```
(Get-ChildItem -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss | Where-Object { $_.GetValue("DistributionName") -eq 'Ubuntu-24.04' }).GetValue("BasePath") + "\ext4.vhdx"
输出示例：
C:\Users\yourusername\AppData\Local\wsl\{uuid}\ext4.vhdx
```

1. 创建目标目录

```
# 在 F 盘创建目标目录
New-Item -ItemType Directory -Path "F:\WSL_imgs\Ubuntu24" -Force
```

1. 导出系统镜像

```
# 正确导出命令（注意：目标文件路径必须不存在）
wsl --export Ubuntu-24.04 F:\WSL_imgs\Ubuntu24\ubuntu2404.vhdx --vhd
```

1. 注销原系统(Ubuntu系统)

```
wsl --unregister Ubuntu-24.04
```

1. 导入到新位置

```
# 从导出的镜像重新导入
wsl --import Ubuntu-24.04 F:\WSL_imgs\Ubuntu24 F:\WSL_imgs\Ubuntu24\ubuntu2404.vhdx --vhd
```

1. 重新配置用户设置

```
# 查看当前系统中的用户（需要先启动系统）
wsl -d Ubuntu-24.04

# 在 Ubuntu 中查看用户
cat /etc/passwd | grep '/home'

# 设置默认用户（将 yourusername 替换为你的实际用户名）
Ubuntu-24.04 config --default-user yourusername
```

1. 验证迁移结果

```
# 查看 WSL 系统状态
wsl -l -v

# 测试启动
wsl -d Ubuntu-24.04
```

## Hermes Agent安装部署

通过一行安装命令，你可以在两分钟内快速启动 Hermes Agent。

1. Linux / macOS / WSL2**(需启动wsl，在wsl终端下运行安装指令)**

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
或以下镜像
irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1 | iex
```

唯一前置依赖是 Git，其余内容安装脚本会自动处理。

1. 重新加载用户配置文件

```bash
source ~/.bashrc
```

执行后则无需关闭并重新打开终端。

1. 启动 Hermes Agent 的命令行交互界面

```bash
hermes
```

若成功显示配置向导界面即表明安装成功。

注：来源整合

WSL环境配置：[https://blog.csdn.net/qq_29752857/article/details/155392406](https://blog.csdn.net/qq_29752857/article/details/155392406)

Hermes Agent安装：[https://hermes-agent.nousresearch.com/docs/](https://hermes-agent.nousresearch.com/docs/)

Hermes Agent配置：[https://developer.aliyun.com/article/1725007](https://developer.aliyun.com/article/1725007)