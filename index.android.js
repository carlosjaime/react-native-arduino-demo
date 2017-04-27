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