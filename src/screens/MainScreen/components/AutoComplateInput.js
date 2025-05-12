import React, {useContext, useState,useRef} from 'react'

import {View, TextInput, Dimensions, ActivityIndicator, TouchableOpacity,Text, ScrollView,Image,StyleSheet,I18nManager} from 'react-native'
  import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import {parseIcon}from "../helper"
  import {useTranslation} from 'react-i18next'
import {API_GOOGLE} from  "@env"
function AutoComplateInput({value,loading,setLocationInfo,setLoading,changeRegion}) {
     const {t} = useTranslation()
    const [focus,setFocus]=useState(false)
    const [places, setPlaces] = useState([]);
    const inputRef = useRef(null);

    const fetchPlacesAutocomplete = async (query) => {
        if (!query) {
          setPlaces([]);
          return;
        }
        setLoading(true)
    
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${API_GOOGLE}`;
    
        try {
          const response = await fetch(url);
          const data = await response.json();
          
          setLoading(false)
          if (data.status === 'OK') {
            setPlaces(data.predictions);
          } else {
            setPlaces([]);
          }
        } catch (error) {
            setLoading(false)
          console.log('Error fetching places:', error);
          setPlaces([]);
        }
      };
    
      const onPlaceSelect = async (place) => {

  setLocationInfo(place.description);
      
        setPlaces([]);
        setLoading(true)
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=AIzaSyBqEb5qH08mSFysEOfSTIfTezbhJjJZSRs`;
        inputRef.current.blur()
        try {
          const response = await fetch(detailsUrl);
          const data = await response.json();
          setLoading(false)
          if (data.status === 'OK') {
            const { geometry } = data.result;
            changeRegion({
                latitude: geometry.location.lat,
                longitude: geometry.location.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              })
           
    
           
          }
        } catch (error) {
            setLoading(false)
          console.log('Error fetching place details:', error);
        }
      };

      
    const onChangeText=(text)=>{
       setLocationInfo(text)
        fetchPlacesAutocomplete(text)
       }


       const renderItems=(item)=>{
       
         return(
            <TouchableOpacity key={item.place_id}  style={{padding:8,borderBottomWidth:0.5,borderColor:"#334155"}} onPress={()=>{onPlaceSelect(item)}} >

            <View style={{flexDirection:"row",alignItems:"center"}} >
            <MaterialIcons style={{marginLeft:8,marginRight:4,}} name={parseIcon(item)} size={30} color={"#F9DC76"}></MaterialIcons>

           
            <Text style={{fontSize:14,fontWeight:"400",color:"#000",width:"80%"}} numberOfLines={1} >{item.description}</Text>

            </View>
            </TouchableOpacity>
        )
    }

       
    return (
        <>
       
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
                     <View style={[style.inputContainer, {borderColor: "#ccc", height: 48, flex: 1}]}>
                     
                        <TextInput ref={inputRef} onBlur={()=>setFocus(false)} onFocus={()=>setFocus(true)} value={value} onChangeText={onChangeText} placeholder={t('search_placeholder')} selectionColor={ "#F9DC76"} placeholderTextColor={"#94A3B8"} style={[style.r14, {paddingHorizontal: 10, color: "#000", flex: 1}]} />
                        {loading?<ActivityIndicator/>:(<MaterialIcons name="search"  size={25} color={"#94A3B8"}/>)}

  
    </View>
    </View>
    
   {places.length>0&&(
     <ScrollView style={{position:"absolute",width:"100%",alignSelf:"center",backgroundColor:"#fff",zIndex:999999999,top:60,borderColor:"#ccc",borderWidth:1,borderRadius:10}}>
        {places.map(renderItems)}
       
    </ScrollView>)}
    </>

    );
}

const style=StyleSheet.create({
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth:1,
 
    marginTop: 10,
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 56,
    // flex: 1
},
r14: {
  fontSize: 14,
  color: "#94A3B8",
  borderColor:"#ccc",
  // fontFamily: 'SFArabic-Regular',
  textAlign:I18nManager.isRTL?'left':'right'  
},
})

export default AutoComplateInput;