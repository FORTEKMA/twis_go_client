import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  I18nManager,
  Platform
} from 'react-native';
import { colors } from '../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TicketItem from './components/TicketItem';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import api from '../../utils/api';
import { useSelector } from 'react-redux';
import { 
  trackScreenView, 
  trackTicketViewed,
  trackTicketCreated 
} from '../../utils/analytics';

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="ticket-outline" size={80} color={colors.secondary_3} />
      <Text style={styles.emptyTitle}>{t('tickets.empty_title')}</Text>
      <Text style={styles.emptyText}>{t('tickets.empty_text')}</Text>
    </View>
  );
};

const TicketScreen = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const currentUser = useSelector(state => state?.user?.currentUser);

  // Track screen view on mount
  useEffect(() => {
    trackScreenView('Tickets');
  }, []);

  const fetchTickets = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `tickets?filters[client][id][$eq]=${currentUser.id}&sort=createdAt:desc&pagination[page]=${pageNumber}&pagination[pageSize]=10&populate[0]=attachment&populate[1]=command`
      );
      console.log(response.data.meta)
      const newTickets = response.data.data || [];
      const pagination = response.data.meta?.pagination;
      
      setHasMore(pagination?.page < pagination?.pageCount);
      setPage(pageNumber);
      
      if (pageNumber === 1) {
        setTickets(newTickets);
      } else {
        setTickets(prev => [...prev, ...newTickets]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error.response);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchTickets(page + 1);
    }
  };

  const handleNewTicket = () => {
    trackTicketCreated('new_ticket');
    navigation.navigate('NewTicketScreen', {
      onSubmit: () => {
        // Reset pagination and fetch fresh data
        setPage(1);
        fetchTickets(1);
      }
    });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.general_1} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"} size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('tickets.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TicketItem ticket={item} />}
          contentContainerStyle={[
            styles.listContainer,
            tickets.length === 0 && styles.emptyListContainer
          ]}
          ListEmptyComponent={EmptyState}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => 
            hasMore && !isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} />
            ) : null
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleNewTicket}
      >
        <Ionicons name="add-circle" size={24} color={colors.general_1} />
        <Text style={styles.addButtonText}>{t('tickets.new')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.general_1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary_3,
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    width: 32, // To balance the back button
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Add padding for the floating button
  },
  addButton: {
    position: 'absolute',
    bottom: Platform.OS=="ios"?50: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    marginLeft: 8,
    color: colors.general_1,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.secondary_2,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyListContainer: {
    flex: 1,
  },
  footerLoader: {
    paddingVertical: 20,
  },
});

export default TicketScreen; 