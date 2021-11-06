
export interface Settings {
    readonly NodeUrl: string;
    readonly ContractAddress: string;
}

export const settings: Settings = {
    NodeUrl: "https://rpc.juno.giansalex.dev:443",
    ContractAddress: process.env.REACT_APP_CONTRACT || "juno1n78c8ckw5xwktg7laae7utrm7jtyrsshnfrl9n72xzlxz9gpq0zsyxcyex",
};
