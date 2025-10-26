import { TopicMessageQuery, TopicId } from "@hashgraph/sdk";
import { client } from "./hederaClient.js";

export async function subscribeToTopic(topicId: string, callback: (msg: any) => void): Promise<void> {
    try {
        console.log(`🔔 Subscribing to topic ${topicId}...`);

        new TopicMessageQuery()
            .setTopicId(TopicId.fromString(topicId))
            .subscribe(client, null, (message) => {
                try {
                    const decoded = JSON.parse(new TextDecoder().decode(message.contents));
                    console.log(`📨 Received message on topic ${topicId}:`, decoded.type);
                    callback(decoded);
                } catch (parseError) {
                    console.error("❌ Failed to parse message:", parseError);
                }
            });
    } catch (error) {
        console.error("❌ Failed to subscribe to topic:", error);
        throw error;
    }
}

export async function subscribeToTopicWithErrorHandling(
    topicId: string,
    callback: (msg: any) => void,
    errorCallback?: (error: any) => void
): Promise<void> {
    try {
        console.log(`🔔 Subscribing to topic ${topicId} with error handling...`);

        new TopicMessageQuery()
            .setTopicId(TopicId.fromString(topicId))
            .subscribe(client, null, (message) => {
                try {
                    const decoded = JSON.parse(new TextDecoder().decode(message.contents));
                    console.log(`📨 Received message on topic ${topicId}:`, decoded.type);
                    callback(decoded);
                } catch (parseError) {
                    console.error("❌ Failed to parse message:", parseError);
                    if (errorCallback) errorCallback(parseError);
                }
            });
    } catch (error) {
        console.error("❌ Failed to subscribe to topic:", error);
        if (errorCallback) errorCallback(error);
        throw error;
    }
}
