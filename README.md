# 用react-native制作控制arduino的app

## 使用技术&工具
arduino UNO

[nodejs](http://nodejs.org/)：Node.js®是一个基于Chrome V8 JavaScript引擎构建的JavaScript后端。

[johnny-five](http://johnny-five.io/examples/)：nodejs用于和arduino通讯的库，内置node-serialport。

[socketio](https://socket.io/)：网页前后端实时通讯。在线office就运用了这个技术。

[React Native](https://facebook.github.io/react-native/): 使用React生成原生app的前端框架。

[android studio](https://developer.android.com/studio/index.html?hl=zh-cn)：调试打包react-native程序为apk

## 流程
### 思考

1. 电脑 <--> arduino : 由于arduino不能像raspberryPi那样运行程序，所以服务端应该放在电脑上，通过USB或者WIFI来和arduino连接

2. 电脑(后端) <--> 手机(前端) : 编译好的apk在手机端安装后，手机屏幕上和按钮交互，触发javascript的socketio的emit函数。后端监听到emit传入的信号，执行控制arduino的代码

3. 手机 <--> arduino ？ ：或许可以在手机上写前程序直接控制arduino。参考[android thing](https://developer.android.com/things/index.html)

### 后端
用`sudo node server.js` 运行后端。arduino闪烁，terminal中显示说明运行成功。
```
1493273739150 Available /dev/ttyACM0
1493273739157 Connected /dev/ttyACM0
1493273740833 Repl Initialized
```

server.js的具体代码
```
var httpServer = require('http').createServer()
var five = require("johnny-five");
var io = require('socket.io')(httpServer)

//后端接口
let port = 3002; 

httpServer.listen(port)
console.log('Server available at http://192.168.6.178:' + port);  

var board = new five.Board();
var led;

//johnny-five
board.on("ready", function() {
  console.log("Board is ready!")
  led = new five.Led(13)
});

//socket.io
io.on('connection',socket=>{
  console.log(`New Connection: ${socket.id}`)

  socket.on('led:on',data=>{
    led.blink()
    console.log(`LED On`)
  })

  socket.on('led:off',data=>{
    led.stop().off()
    console.log(`LED Off`)
  })
})
```

### 前端
使用react-native-cli生成，还需要安装android studio，中间有很多坑。具体**待填**
```
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Switch
} from 'react-native';
import io from 'socket.io-client'

export default class Jxs extends Component {
  constructor(props){
    super(props);
    this.state = {
      ledValue:false,
      // 端口不能用localhost,服务器端的防火墙需开放3002端口
      socket: io('http://192.168.6.178:3002',{}),
    }
  };
  
  componentDidMount(){
    this.state.socket.connect()
  };

  componentWillUnmount(){
    this.state.socket.disconnect()
  };

  // 由于只是切换开关,发送数据可以为{}
  _emitEvent(action,data = {}){
    this.state.socket.emit(action, data)
  };

  //逻辑为<Swith>onValueChange触发时执行, 此handleLEDSwith函数.函数传入Swith的value,即this.state.ledValue,
  // 赋予state后,计算出action,传入_emitEvent给后端处理
  _handleLEDSwitch(value){
    this.setState({ledValue:value})
    let action = !this.state.ledValue ? 'led:on' : 'led:off'
    this._emitEvent(action)

  }

//和react不同, html标签必须是导入的组件,大写开头,提前import
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>OFF/ON</Text>
           <Switch
            onValueChange={(value) => this._handleLEDSwitch(value)}
            style={{marginBottom: 10}}
            value={this.state.ledValue}/>
      </View>
    );
  }
}

//css
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

//注意 reactNativeArduino为package.json中的name
AppRegistry.registerComponent('reactNativeArduino', () => Jxs);
```