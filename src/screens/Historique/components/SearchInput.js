import React, { useState } from "react";
import { View, TextInput, Image } from "react-native";
import { colors } from "../../../utils/colors";
import { useTranslation } from "react-i18next";

export const SearchInput = ({ setFilter }) => {
  const [searchText, setSearchText] = useState("");
  const { t } = useTranslation();

  const handleSearch = (text) => {
    setSearchText(text);
    setFilter(text);
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
      {/* <Image
        source={require("../../../assets/search.png")}
        style={{ width: 20, height: 20, marginRight: 10 }}
      /> */}
      <TextInput
        style={{
          flex: 1,
          color: "#fff",
          fontSize: 16,
        }}
        placeholder={t("common.search_orders")}
        placeholderTextColor={colors.gray}
        value={searchText}
        onChangeText={handleSearch}
      />
    </View>
  );
}; 