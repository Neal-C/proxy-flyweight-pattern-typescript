function createSubscribable<MessageType>(){
    const subscribers : Set<(msg: MessageType) => void> = new Set();

    return {
        subscribe(callback: (msg: MessageType) => void ): () => void {

            subscribers.add(callback);

            return () => {
                subscribers.delete(callback)
            }
        },

        publish(msg: MessageType): void {
            subscribers.forEach(callback => callback(msg));
        }
    }
};

type ObservableMessage<T> = {
    target: T;
    property: string;
};

type Observable<T> = T & { subscribe: (callback: (data: ObservableMessage<T>)=> void) => void};

function createObservable<DataType>(data: DataType): Observable<DataType> {
    const subsribers = createSubscribable<ObservableMessage<DataType>>()

    return new Proxy({...data, subscribe: subsribers.subscribe}, {
        set: (target: object, property: string, value: any) => {

            Reflect.set(target, property, value);

            subsribers.publish({
                target,
                prop: property
            } as unknown as ObservableMessage<DataType>);

            //returning true to significate successful operation => settin the new value
            return true;
        }
    }) as Observable<DataType>;
};

interface Message {
    message1: string;
    message2: string;
}

const target: Message = {
    message1: "Hey, if you made it here: Hire me",
    message2: "yep, got you offguard"
}

const proxy = createObservable(target);
proxy.subscribe(console.log);

proxy.message1 = "uh ho";
proxy.message2 = "carry on folks"

//npx ts-node proxy.ts