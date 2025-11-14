import { Platform } from 'react-native';
// Import 'Call' and 'CallInvite' for type safety
import { Voice, Call, CallInvite } from '@twilio/voice-react-native-sdk';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';

export class TwilioManager {
  static voice = new Voice();

  /**
   * Initializes all the global listeners for the Voice SDK.
   * Call this ONCE when your app loads.
   */
  static initializeListeners(): void {
    console.log('Initializing Twilio global listeners...');

    // (FIXED) These are the correct global events.
    // Events related to a call's state (like connect, disconnect)
    // are attached to the 'Call' object itself, not here.
    TwilioManager.voice.on(Voice.Event.CallInvite, (callInvite: CallInvite) => {
      console.log('Incoming call invite', callInvite);
      // TODO: Handle incoming call (e.g., show incoming call UI)
      // You can attach listeners to the callInvite here
      // callInvite.on(CallInvite.Event.Cancelled, () => { ... });
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

    const micStatus = await request(micPermission);
    if (micStatus !== RESULTS.GRANTED) {
      console.error('Microphone permission not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      const phonePermission = PERMISSIONS.ANDROID.READ_PHONE_STATE;
      const phoneStatus = await request(phonePermission);
      if (phoneStatus !== RESULTS.GRANTED) {
         console.error('Phone permission not granted');
         return false;
      }
    }
    
    console.log('Permissions granted.');
    return true;
  }

  /**
   * Registers the app for push notifications and then registers the client
   * with Twilio using the Access Token.
   */
  static async registerClient(accessToken: string): Promise<void> {
    console.log('Registering Twilio client...');
    try {
      // 1. Ensure Firebase messaging is set up and has a token
      // We don't need to pass the token, but we should ensure it's ready.
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Push notification permission denied.');
        // This might be fine if you only make outgoing calls
      } else {
        const fcmToken = await messaging().getToken();
        if (!fcmToken) {
          console.log('Failed to get FCM token.');
        } else {
          console.log('FCM Token is available (SDK will use it automatically):', fcmToken);
        }
      }
      
      // 2. Register with Twilio
      // (FIXED) The register method only takes the accessToken.
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
      const permissionsGranted = await this.requestPermissions();
      if (!permissionsGranted) {
        console.error('Cannot make call, permissions not granted.');
        return;
      }
      
      const call = await TwilioManager.voice.connect(accessToken, {
        params: {
          To: phoneNumber
        }
      });
      console.log('Call initiated.', call);

      // --- IMPORTANT ---
      // You attach call-specific listeners HERE
      call.on(Call.Event.Connected, () => {
        console.log('Call.Event.Connected');
      });
      call.on(Call.Event.Disconnected, () => {
        console.log('Call.Event.Disconnected');
      });
    //   call.on(Call.Event.Failed, (error) => {
    //     console.log('Call.Event.Failed', error);
    //   });
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
      // (FIXED) The correct method is 'unregister', not 'destroy'.
      // It likely needs the same accessToken to unregister.
      await TwilioManager.voice.unregister(accessToken);
    } catch (error) {
      console.error('Error cleaning up Twilio:', error);
    }
  }
}