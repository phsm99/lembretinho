import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Dimensions, TextInput, Modal, Alert } from 'react-native';
import Constants from "expo-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [descricaoItem, setDescricaoItem] = useState('');
  const [qntdItem, setqndtItem] = useState('');
  const [tipoItem, setTipoItem] = useState('');

  const [modalVisible, setModalVisible] = useState(false)
  const [itens, setItens] = useState([]);
  const [idAlterar, setIdAlterar] = useState(-1);
  const [order, setOrder] = useState('ASC');

  useEffect(() => {
    armazenaDados();
  }, [itens]);

  useEffect(() => {
    recuperaDados();
  }, []);

  function ordernarLista() {
    let res = [];
    if (order == 'ASC') {
      res = itens.sort((a, b) => {
        if (a.descricao > b.descricao) {
          return 1;
        }
        if (a.descricao < b.descricao) {
          return -1;
        }
        return 0;
      })
    }
    else {
      res = itens.sort((a, b) => {
        if (a.descricao < b.descricao) {
          return 1;
        }
        if (a.descricao > b.descricao) {
          return -1;
        }
        return 0;
      })
    }
    setItens(res);
    order == 'ASC' ? setOrder('DESC') : setOrder('ASC');
  }

  async function armazenaDados() {
    try {
      await AsyncStorage.setItem('@Myapp:lista', JSON.stringify(itens));
    } catch (error) {
      console.log(error);
      console.log('Não foi possível armazenar os itens!');
    }
  }

  async function recuperaDados() {
    try {
      const i = await AsyncStorage.getItem('@Myapp:lista');
      if (i !== null)
        setItens(JSON.parse(i));
    } catch (error) {
      console.log(error);
      console.log('Os itens não foram carregados!');
    }
  }

  function inserirItem() {
    if (!tipoItem || !descricaoItem || qntdItem == 0) {
      Alert.alert('Favor preencher todos os campos');
      return;
    }

    const elemento = {
      id: Math.round(Math.random() * 100),
      descricao: descricaoItem,
      qntd: qntdItem,
      tipo: tipoItem
    };

    setItens([...itens, elemento]);
    setModalVisible(false);
    limparCampos();
  }

  function alterarItem() {
    var indexItem = itens.findIndex(el => { return el.id == idAlterar })

    const item = itens[indexItem];
    item.descricao = descricaoItem;
    item.qntd = qntdItem;
    item.tipo = tipoItem;

    const filtro = itens.filter(x => x.id != idAlterar);
    setItens([...filtro, item]);
    setModalVisible(false);
    limparCampos();
  }



  function excluirItem(idItem) {
    setItens(itens.filter(x => x.id != idItem));

    setModalVisible(false);
    limparCampos();
  }

  function editarItemModal(idItem) {
    const elemento = itens.filter(x => x.id == idItem)[0];
    if (elemento) {
      setDescricaoItem(elemento.descricao);
      setqndtItem(elemento.qntd);
      setTipoItem(elemento.tipo);

      setModalVisible(true);
      setIdAlterar(idItem);
    }
  }

  function limparCampos() {
    setDescricaoItem('');
    setqndtItem('');
    setTipoItem('');
    setIdAlterar(-1);
  }

  return (
    <View style={styles.container}>

      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerText}>LISTA DE COMPRAS</Text>
      </View>

      <View style={styles.buttonsView}>
        <View>
          <View style={[styles.button, {
            borderRadius: 30
          }]}>
            <Text style={styles.badgeText}>{itens.length}</Text>
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => { ordernarLista() }}
            style={styles.button}>
            <Image style={{ width: 30, height: 30 }} source={require('./assets/upDown.png')} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        {itens.length == 0 ?
          <Image  source={require('./assets/basket.png')}/> :
          <FlatList
            data={itens}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => String(item.id)}
            renderItem={({ item: it }) => (
              <View style={styles.item}>
                <TouchableOpacity
                  onPress={() => { editarItemModal(it.id) }}
                >
                  <View style={styles.row} >
                    <Text style={styles.textItem}>{it.descricao.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.row, { justifyContent: 'space-between', marginTop: 10 }]}>
                    <Text style={styles.textItem}>{`Qntd: ${it.qntd}`}</Text>
                    <Text style={styles.textItem}>{it.tipo}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

          />
        }

      </View>

      <View style={styles.addButton}>
        <TouchableOpacity style={[styles.button, {
          borderRadius: 30,
          backgroundColor: '#fff'
        }]}
          onPress={() => setModalVisible(true)}>
          <Text style={{ fontSize: 30, marginTop: -3 }}>+</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={styles.modal}>
          <View style={styles.modalView}>

            <View style={styles.formItem}>
              <Text style={styles.textModal}>Descrição:</Text>
              <TextInput style={styles.input}
                placeholder="Descrição"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={true}
                blurOnSubmit={true}
                returnKeyType={"done"}
                value={descricaoItem}
                onChangeText={text => setDescricaoItem(text)}
              />
            </View>

            <View style={styles.formItem}>
              <Text style={styles.textModal}>Quantidade:</Text>
              <TextInput style={styles.input}
                placeholder="Quantidade"
                placeholderTextColor="#999"
                keyboardType={"number-pad"}
                blurOnSubmit={true}
                returnKeyType={"done"}
                value={qntdItem}
                onChangeText={text => setqndtItem(text)}
              />
            </View>

            <View style={styles.formItem}>
              <Text style={styles.textModal}>Tipo:</Text>
              <TextInput style={styles.input}
                placeholder="Tipo"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={true}
                blurOnSubmit={true}
                returnKeyType={"done"}
                value={tipoItem}
                onChangeText={text => setTipoItem(text)}
              />
            </View>

            <View style={styles.buttonsModal}>
              <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "#edf6f9" }}
                onPress={() => {
                  limparCampos();
                  setModalVisible(!modalVisible);
                }}
              >
                <Text style={styles.textStyle} >CANCELAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "#3b78ac" }}
                onPress={() => {
                  idAlterar == -1 ? inserirItem() : alterarItem();
                }}
              >
                <Text style={styles.textStyle} >SALVAR</Text>
              </TouchableOpacity>

              {idAlterar != -1 ?
                <TouchableOpacity
                  style={{ ...styles.openButton, backgroundColor: "#ef233c" }}
                  onPress={() => {
                    excluirItem(idAlterar);
                  }}
                >
                  <Text style={styles.textStyle} >EXCLUIR</Text>
                </TouchableOpacity>
                :
                null
              }

            </View>
          </View>
        </View>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    height: 70,
    backgroundColor: '#1d3a4e'
  },
  headerText: {
    flex: 1,
    marginTop: 15,
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 35,
    color: '#fff'
  },
  buttonsView: {
    marginTop: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    borderColor: '#000',
    borderWidth: 2,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  body: {
    marginTop: 10,
    marginHorizontal: 10,
  },
  item: {
    padding: 5,
    marginTop: 10,
    borderColor: '#5d5959',
    borderWidth: 1,
    borderRadius: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%'
  },
  textItem: {
    fontSize: 20
  },
  addButton: {
    position: 'absolute',
    bottom: 15,
    left: 10
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderColor: '#5d5959',
    borderWidth: 1,
    height: 50,
    fontSize: 30,
    paddingHorizontal: 5,
    marginTop: 5
  },
  textModal: {
    fontSize: 20,
  },
  formItem: {
    marginTop: 10
  },
  modal: {
    flex: 1,
    height: '100%',
    marginTop: Constants.statusBarHeight + 75,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 10,
    height: '100%'
  },
  openButton: {
    marginTop: 10,
    borderRadius: 5,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 20,
  },
  buttonsModal: {
    marginTop: 100,
  },
  badgeText: {
    fontSize: 20,
    fontWeight: 'bold'
  }

});
