export const handler = async (event: any) => {
    console.log(event);
    // @TODO start some asynchronous operation here and return its ID

    return {
        // ID of the job
        guid: "123",

        // Notify parent State Machine to keep checking for the status
        // of the job, every 1 second
        waitSeconds: 1,
    };
}
