import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  FlatList,
  Text  
} from "react-native";
import { useDispatch, useSelector ,} from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

import { getUserOrdersById } from "../../store/commandeSlice/commandeSlice";
import { styles } from "./styles";
import { StatusFilter } from "./components/StatusFilter";
import { SearchInput } from "./components/SearchInput";
import { Card } from "./components/Card";
import { Empty } from "./components/Empty";
import { colors } from "../../utils/colors";
const Historique = ({ navigation }) => {
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState(null);
  const [filter, setFilter] = useState("");
    
  const pagination = useSelector((state) => state?.commandes?.meta?.pagination);
  
  const userID = useSelector((state) => state?.user?.currentUser?.documentId);
  const [newOrders, setNewOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    getData(true);
  }, [statusFilter, filter]);

 
    useCallback(() => {
      if (isFocused) {
        getData(true);
      }
    }, [isFocused])
 
const mangeStatus = (status) => {
  if(status === null) return [];
  if(status === "active") return ["Pending","Dispatched_to_partner", "Assigned_to_driver", "Driver_on_route_to_pickup", "Arrived_at_pickup", "Picked_up", "On_route_to_delivery",'Arrived_at_delivery'];
  if(status === "completed") return ["Delivered", "Completed"];
  if(status === "cancelled") return ['Canceled_by_client',"Canceled_by_partner"];
}
  const getData = (reset = false) => {
    if(reset) setNewOrders([]);
    if (loading) return;

    setLoading(true);
    dispatch(
      getUserOrdersById({
        id: userID,
        currentPage: reset ? 1 : pagination?.page + 1,
        pageSize: pagination?.pageSize,
        filter: filter,
        status: mangeStatus(statusFilter),
      })
    )
      .then((res) => {
       
        setLoading(false);
        if (reset == true) {
          setNewOrders(res.payload.data);
        } else {
          setNewOrders((prevOrders) => [...prevOrders, ...res.payload.data]);
        }
        
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
  };

  const handleSearch = (searchTerm) => {
    setFilter(searchTerm);
  };

  const handleEndReached = () => {
    if (pagination?.pageCount && pagination?.pageCount > pagination?.page && !loading) {
      getData();
    }
  };

  const renderHeader = () => {
    return (
      <View style={{alignItems:'center'}}>
       <StatusFilter
          setStatusFilter={handleFilterChange}
          statusFilter={statusFilter}
        />
        <View style={styles.inputContainer}>
          <SearchInput setFilter={handleSearch} />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
        <Text
        style={styles.headerText}
      >
        Historique
      </Text>  
        </View>
      
     

        <FlatList
          style={{ flex: 1, width: "100%", height: "100%" }}
          data={newOrders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Card key={item.id} order={item} />}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={renderHeader}
          onEndReached={handleEndReached}
          scrollEventThrottle={16}
          ListEmptyComponent={() => <Empty />}
          ListFooterComponent={
            loading && <ActivityIndicator size="large" color={colors.primary} />
          }
        />
      </View>
    </View>
  );
};

export default Historique; 