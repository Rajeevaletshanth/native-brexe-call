import RNCallKeep, { IOptions } from 'react-native-callkeep';
import { Call, CallInvite } from '@twilio/voice-react-native-sdk';
// import { v4 as uuidv4 } from 'uuid';
import { TwilioManager } from './TwilioManager'; // Import TwilioManager

// This class will manage the CallKeep integration
class CallManager {
  private currentCall: Call | null = null;
  private currentCallInvite: CallInvite | null = null;
  private callUUID: string | null = null;
  private isInitialized = false;

  constructor() {
    // 1. Setup CallKeep options
    const options: IOptions = {
      ios: {
        appName: 'Brexe Call',
      },
      android: {
        alertTitle: 'Permissions required',
        alertDescription:
          'This application needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'ok',
        additionalPermissions: [],
      },
    };
    RNCallKeep.setup(options).then(() => (this.isInitialized = true));
  }

  // 2. Initialize CallKeep event listeners
  initializeListeners() {
    // === CallKeep events ===
    // User answered the call from the native UI
    RNCallKeep.addEventListener('answerCall', this.handleAnswerCall);

    // User rejected or hung up the call from the native UI
    RNCallKeep.addEventListener('endCall', this.handleEndCall);
  }

  // === Event Handlers ===
  private handleAnswerCall = async (data: { callUUID: string }) => {
    if (this.currentCallInvite && data.callUUID === this.callUUID) {
      console.log('CallManager: Answering call...');
      // Accept the Twilio CallInvite
      const call = await this.currentCallInvite.accept();
      this.currentCall = call;

      // Set up Twilio call event listeners
      this.setupCallListeners(call);
    }
  };

  private handleEndCall = async (data: { callUUID: string }) => {
    if (data.callUUID === this.callUUID) {
      if (this.currentCall) {
        // 1. If call is active, disconnect it
        console.log('CallManager: Ending active call...');
        this.currentCall.disconnect();
      } else if (this.currentCallInvite) {
        // 2. If call is just ringing, reject it
        console.log('CallManager: Rejecting ringing call...');
        this.currentCallInvite.reject();
      }
      this.cleanupCallState();
    }
  };

  // === Public Methods ===

  /**
   * Called by TwilioManager when a new CallInvite is received.
   * This triggers the native incoming call UI.
   */
  displayIncomingCall = (callInvite: CallInvite) => {
    if (!this.isInitialized) {
      console.error('CallKeep not initialized!');
      return;
    }
    
    // Generate a unique ID for this call
    // this.callUUID = uuidv4();
    this.callUUID = "ac5d5d60-349b-4341-86d6-f7fe8e4d3e28";
    this.currentCallInvite = callInvite;

    // Get caller info (you might get 'from' or other custom params)
    const callerName = callInvite.getFrom() || 'Unknown Caller';

    console.log(`CallManager: Displaying incoming call UI for ${this.callUUID}`);
    // Show the native ringing screen
    RNCallKeep.displayIncomingCall(
      this.callUUID,
      callerName,
      callerName,
      'generic',
      false,
    );
  };

  // === Helper Methods ===

  /**
   * Sets up listeners for an active Twilio Call
   */
  private setupCallListeners = (call: Call) => {
    call.on(Call.Event.Disconnected, () => {
      console.log('CallManager: Twilio call disconnected.');
      // 1. Tell CallKeep to end the call UI
      if (this.callUUID) {
        RNCallKeep.endCall(this.callUUID);
      }
      // 2. Clean up our internal state
      this.cleanupCallState();
    });

    call.on(Call.Event.ConnectFailure, () => {
      console.log('CallManager: Twilio call failed to connect.');
      if (this.callUUID) {
        RNCallKeep.endCall(this.callUUID);
      }
      this.cleanupCallState();
    });
  };

  /**
   * Resets the internal call state
   */
  private cleanupCallState = () => {
    this.currentCall = null;
    this.currentCallInvite = null;
    this.callUUID = null;
  };
}

// Export a singleton instance
export const callManager = new CallManager();