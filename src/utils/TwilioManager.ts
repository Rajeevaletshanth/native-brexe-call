import { Platform, Alert } from 'react-native'; // Import Alert
import { Voice, Call, CallInvite } from '@twilio/voice-react-native-sdk';
// Import 'openSettings', 'PERMISSIONS', and 'RESULTS'
import {
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';
// Import the CallManager to handle incoming calls
import { callManager } from './CallManager';

export class TwilioManager {
  static voice = new Voice();

  static initializeListeners(): void {
    console.log('Initializing Twilio global listeners...');

    TwilioManager.voice.on(Voice.Event.CallInvite, (callInvite: CallInvite) => {
      console.log('TwilioManager: Incoming call invite', callInvite);
      
      // FIX: Pass the call to CallManager to make the phone ring
      callManager.displayIncomingCall(callInvite);
    });

    TwilioManager.voice.on(Voice.Event.Registered, () => {
      console.log('Twilio client is registered.');
    });

    TwilioManager.voice.on(Voice.Event.Unregistered, () => {
      console.log('Twilio client is unregistered.');
    });
    
    TwilioManager.voice.on(Voice.Event.Error, (error: Error) => {
       console.error('Twilio Global Error:', error);
    });
  }

  /**
   * Requests Microphone and (on Android) Phone permissions.
   */
  static async requestPermissions(): Promise<boolean> {
    console.log('Requesting permissions...');
    
    const micPermission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.MICROPHONE
      : PERMISSIONS.ANDROID.RECORD_AUDIO;

    // --- Check Microphone ---
    const micStatus = await request(micPermission);
    if (micStatus !== RESULTS.GRANTED) {
      console.error('Microphone permission not granted. Status:', micStatus);
      return false;
    }
    console.log('Microphone permission granted.');


    // --- Check Phone State (Android Only) ---
    // if (Platform.OS === 'android') {
    //   const phonePermission = PERMISSIONS.ANDROID.READ_PHONE_STATE;
    //   console.log('Requesting permission:', phonePermission);
    //   const phoneStatus = await request(phonePermission);

    //   switch (phoneStatus) {
    //     case RESULTS.GRANTED:
    //       console.log('Phone permission is GRANTED');
    //       break;
    //     case RESULTS.DENIED:
    //       console.error('Phone permission was DENIED by the user.');
    //       return false;
        
    //     case RESULTS.BLOCKED:
    //       console.error(
    //         'Phone permission is BLOCKED. Showing alert to open settings.',
    //       );
    //       // Show an alert that takes the user directly to settings
    //       Alert.alert(
    //         'Permission Blocked',
    //         'This app needs permission to make and manage phone calls. Please tap "Open Settings" and manually enable the "Phone" permission.',
    //         [
    //           {
    //             text: 'Cancel',
    //             style: 'cancel',
    //           },
    //           {
    //             text: 'Open Settings',
    //             // This function opens the app's settings page
    //             onPress: () => openSettings(),
    //           },
    //         ],
    //       );
    //       return false;
          
    //     case RESULTS.UNAVAILABLE:
    //       console.error(
    //         'Phone permission is UNAVAILABLE on this device.',
    //       );
    //       return false;
    //     default:
    //       console.error('Unknown phone permission status:', phoneStatus);
    //       return false;
    //   }
    // }
    
    console.log('All permissions granted.');
    return true;
  }

  /**
   * Registers the app for push notifications.
   */
  static async registerClient(accessToken: string): Promise<void> {
    console.log('Registering Twilio client...');
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Push notification permission denied.');
      } else {
        const fcmToken = await messaging().getToken();
        if (!fcmToken) {
          console.log('Failed to get FCM token.');
        } else {
          console.log('FCM Token is available (SDK will use it automatically):', fcmToken);
        }
      }
      
      await TwilioManager.voice.register(accessToken);
      console.log('Twilio client registration successful.');

    } catch (error) {
      console.error('Error registering Twilio client:', error);
    }
  }

  /**
   * Makes an outgoing call.
   */
  static async makeCall(accessToken: string, phoneNumber: string): Promise<void> {
    console.log(`Making call to ${phoneNumber}...`);
    try {
      // FIX: Removed the duplicate permission check
      
      const call = await TwilioManager.voice.connect(accessToken, {
        params: {
          To: phoneNumber
        }
      });
      console.log('Call initiated.', call);

      call.on(Call.Event.Connected, () => {
        console.log('Call.Event.Connected');
      });
      call.on(Call.Event.Disconnected, () => {
        console.log('Call.Event.Disconnected');
      });
      call.on(Call.Event.Ringing, () => {
        console.log('Call.Event.Ringing');
      });
      
    } catch (error) {
      console.error('Error making call:', error);
    }
  }

  /**
   * Cleans up the Twilio Voice SDK on logout.
   */
  static async cleanup(accessToken: string): Promise<void> {
    console.log('Cleaning up Twilio...');
    try {
      await TwilioManager.voice.unregister(accessToken);
    } catch (error) {
      console.error('Error cleaning up Twilio:', error);
    }
  }
}