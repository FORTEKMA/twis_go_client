import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Linking,
} from 'react-native';
import { colors } from '../../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

const TicketItem = ({ ticket }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const { t } = useTranslation();

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const getStatusColor = (action) => {
    switch (action) {
      case 'open':
        return colors.secondary;
      case 'inProgress':
        return colors.orange;
      case 'resolved':
        return "#2ecc71";
      case 'closed':
        return "#2ecc71";
      default:
        return colors.secondary_2;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleAttachmentPress = () => {
    if (ticket.attachment?.url) {
      Linking.openURL(ticket.attachment.url);
    }
  };

  const renderAttachment = () => {
    if (!ticket.attachment) return null;

    const isImage = ticket.attachment.mime?.startsWith('image/');
    
    return (
      <TouchableOpacity 
        style={styles.attachmentContainer}
        onPress={handleAttachmentPress}
        activeOpacity={0.7}
      >
        <View style={styles.attachmentHeader}>
          <Ionicons name="attach-outline" size={16} color={colors.primary} />
          <Text style={styles.attachmentLabel}>{t('tickets.attachment')}</Text>
        </View>
        
        {isImage ? (
          <Image
            source={{ uri: ticket.attachment.url }}
            style={styles.attachmentImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.attachmentFile}>
            <Ionicons name="document-outline" size={24} color={colors.primary} />
            <Text style={styles.attachmentFileName} numberOfLines={1}>
              {ticket.attachment.name || t('tickets.attachmentFile')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{ticket.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(ticket.action) },
            ]}
          >
            <Text style={styles.statusText}>
              {t(`tickets.status.${ticket.action}`)}
            </Text>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <View style={styles.dateInfoContainer}>
            {ticket.command && (
              <View style={styles.commandContainer}>
                <Ionicons name="receipt-outline" size={14} color={colors.secondary_2} />
                <Text style={styles.commandText}>
                  {t('tickets.command')}: {ticket.command.refNumber || ticket.command}
                </Text>
              </View>
            )}
            <Text style={styles.date}>{formatDate(ticket.createdAt)}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.secondary_2}
          />
        </View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          {
            maxHeight: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 800],
            }),
            opacity: animation,
          },
        ]}
      >
        <View style={styles.messageContainer}>
          <View style={styles.messageHeader}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
            <Text style={styles.messageLabel}>{t('tickets.clientMessage')}</Text>
          </View>
          <Text style={styles.description}>{ticket.description}</Text>
        </View>

        {renderAttachment()}

        {ticket.response && (
          <View style={styles.replyContainer}>
            <View style={styles.replyHeader}>
              <Ionicons name="return-up-back-outline" size={16} color={colors.primary} />
              <Text style={styles.replyLabel}>{t('tickets.response')}</Text>
            </View>
            <Text style={styles.replyText}>{ticket.response}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.general_1,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.secondary_3,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.general_1,
    fontSize: 12,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInfoContainer: {
    flex: 1,
  },
  commandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commandText: {
    fontSize: 12,
    color: colors.secondary_2,
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    color: colors.secondary_2,
  },
  content: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.secondary_3,
  },
  messageContainer: {
    marginTop: 16,
    backgroundColor: colors.general_2,
    padding: 12,
    borderRadius: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: colors.general_3,
    lineHeight: 20,
  },
  attachmentContainer: {
    backgroundColor: colors.general_2,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  attachmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  attachmentFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.general_1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary_3,
  },
  attachmentFileName: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  replyContainer: {
    backgroundColor: colors.general_2,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  replyText: {
    fontSize: 14,
    color: colors.general_3,
    lineHeight: 20,
  },
});

export default TicketItem; 