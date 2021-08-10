
export interface Settings {
    readonly ContractAddress: string;
}

export const settings: Settings = {
    ContractAddress: process.env.REACT_APP_CONTRACT || "juno1ns8ujs5lt6mvl3dvxra4kk5acrzx3n7uuwtdpt",
};
