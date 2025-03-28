import React, { useState } from "react";
import { Input } from "native-base";
import Ionicons from "react-native-vector-icons/Ionicons";

const SearchInput = ({ onFocus, onBlur, setFilter }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleInputFocus = () => {
    setIsInputFocused(true);
    onFocus && onFocus();
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    onBlur && onBlur();
  };

  const handleSubmitEditing = () => {
    setIsInputFocused(false);
    onBlur && onBlur();
    setFilter && setFilter(searchTerm);
  };

  return (
    <>
      {!isInputFocused && (
        <Ionicons name={"search-outline"} size={24} color="black" />
      )}
      <Input
        variant="unstyled"
        placeholder="Rechercher..."
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onSubmitEditing={handleSubmitEditing}
        onChangeText={(text) => setSearchTerm(text)}
      />
    </>
  );
};

export default SearchInput;
