export const handler = async (guid: string) => {
    console.log(guid);
    
    return {
        guid: "123",
        status: "SUCCEEDED",
    };
}
