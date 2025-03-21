import * as DBus from "dbus";

interface Adapter {
    StartDiscovery(cb: (err: DBus.Error | null) => void): void;
}

const dbus = DBus.getBus("system");

dbus.getInterface("org.bluez", "/org/bluez/hci0", "org.bluez.Media1", (err, iface) => {});

dbus.getInterface<Adapter>("org.bluez", "/org/bluez/hci0", "org.bluez.Adapter1", (err, iface) => {
    if (!err) {
        iface.setProperty("Powered", true, err => {
            if (!err) {
                iface.StartDiscovery(() => {});
            }
        });

        iface.setProperty("System", 32, err => {
            if (!err) {
                iface.StartDiscovery(() => {});
            }
        });

        iface.getProperty("Powered", (err: Error | null, value: boolean): void => {});
        iface.getProperty("System", (err: Error | null, value: number): void => {});
    }
});

dbus.disconnect();

const agentPath = "/test/my/agent";
const agentService = DBus.registerService("system", agentPath.split("/").slice(1).join("."));
const agentObj = agentService.createObject(agentPath);
const agentIface = agentObj.createInterface("org.bluez.Agent1");
agentIface.addMethod("Release", { in: "", out: "" }, () => {});
