import EventEmitter from "events";

// Function to wait for an event to be emitted
const waitForEvent = (eventConfig: {eventName: string, timeoutThreshold?: number}, emitter: EventEmitter): Promise<any> => {
    return new Promise((resolve, reject) => {
      const {eventName , timeoutThreshold = 5000} = eventConfig;
      emitter.once(eventName, resolve); // Resolves when the event is emitted
      // Optionally add a timeout to reject if the event takes too long
      setTimeout(() => reject(new Error(`Event "${eventName}" timed out.`)), timeoutThreshold); // 5 seconds timeout
    });
  };
  
  // Function to wait for multiple events
  const waitForMultipleEvents = async (emitter: EventEmitter, eventConfig: {eventName: string, timeoutThreshold?: number }[]): Promise<any[]> => {
    // Wait for each event to be emitted
    const eventPromises = eventConfig.map(event => waitForEvent(event, emitter));
    return Promise.all(eventPromises); // Wait for all events to be emitted
  };
  
  export {  waitForMultipleEvents};
