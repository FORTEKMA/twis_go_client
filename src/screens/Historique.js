/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Text,
  Image,
} from 'react-native';
import StatusFilter from '../components/StatusFilter';
import SearchInput from '../components/SearchInput';

import {colors} from '../utils/colors';
import {useDispatch, useSelector} from 'react-redux';
import {getUserOrdersById} from '../store/commandeSlice/commandeSlice';
import {FlatList} from 'native-base';
import Card from '../components/Card';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const history = require('../assets/calender.png');
const ListEmptyComponent = () => (
  <TouchableOpacity
    style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Image
      source={history}
      style={{
        width: 70,
        height: 70,
        marginTop: 50,
        marginBottom: 20,
      }}
    />
    <Text style={{color: colors.secondary_2}}>
      Vous n'avez pas d'historique de réservation
    </Text>
  </TouchableOpacity>
);

const Historique = ({navigation}) => {
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState(null);
  const [filter, setFilter] = useState('');
  const [meta, setMeta] = useState({
    page: 1,
    pageCount: 0,
    pageSize: 10,
    total: 0,
  });
  const orders = useSelector(state => state?.commandes?.commande);
  const pagination = useSelector(state => state?.commandes?.meta?.pagination);
  const driverId = useSelector(state => state?.user?.currentUser?.id);
  const [newOrders, setNewOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    resetPaginationAndFetch();
  }, [statusFilter, filter]);

  const getData = async (direction = 'down') => {
    if (loading) {
      return;
    }

    setLoading(true);

    const nextPage = direction === 'down' ? meta.page + 1 : 1;

    try {
      await dispatch(
        getUserOrdersById({
          id: driverId,
          currentPage: nextPage,
          pageSize: meta.pageSize,
          filter,
          status: statusFilter,
        }),
      ).then(res => {
        setNewOrders(prevOrders =>
          direction === 'down'
            ? [...prevOrders, ...res?.payload?.data]
            : res?.payload?.data,
        );

        setMeta(prevMeta => ({
          ...prevMeta,
          page: res?.payload?.meta?.pagination?.page,
          pageCount: res?.payload?.meta?.pagination?.pageCount,
          total: res?.payload?.meta?.pagination?.total,
        }));
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetPaginationAndFetch = async () => {
    setRefreshing(true); // Show refresh indicator
    setMeta({...meta, page: 1, pageCount: 0});
    setNewOrders([]);
    await getData('up');
    setRefreshing(false); // Hide refresh indicator
  };

  const handleEndReached = () => {
    if (!loading && meta.page < meta.pageCount) {
      getData('down');
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <StatusFilter
          setStatusFilter={setStatusFilter}
          statusFilter={statusFilter}
        />
        <View style={styles.inputContainer}>
          <SearchInput setFilter={setFilter} />
        </View>
        <FlatList
          ref={flatListRef}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          style={{flex: 1, width: '100%', height: '100%'}}
          data={newOrders}
          keyExtractor={item => item?.id.toString()}
          renderItem={({item}) => <Card order={item} />}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={
            loading && <ActivityIndicator size="large" color={colors.primary} />
          }
          refreshing={refreshing} // Enables pull-to-refresh
          onRefresh={resetPaginationAndFetch} // Triggers refresh when pulled down
        />
      </View>
    </SafeAreaView>
  );
};

export default Historique;

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 100,
    width: wp('80%'),
    alignSelf: 'center',
  },
  clickableText: {
    color: colors.secondary,
    fontSize: hp(1.5),
    fontWeight: '600',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: hp(1),
    backgroundColor: colors.general_2,
    position: 'relative',
  },
  inputContainer: {
    marginTop: 10,
    width: wp('90%'),
    backgroundColor: 'white',
    paddingHorizontal: 10,
    height: hp(7),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.secondary_3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 8,
    shadowOpacity: 0.1,
    shadowRadius: 0.84,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 25,
  },
});
