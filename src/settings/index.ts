
export interface Settings {
    readonly NodeUrl: string;
    readonly ContractAddress: string;
}

export const settings: Settings = {
    NodeUrl: "https://rpc.juno.giansalex.dev:443",
    ContractAddress: process.env.REACT_APP_CONTRACT || "juno1ns8ujs5lt6mvl3dvxra4kk5acrzx3n7uuwtdpt",
};
