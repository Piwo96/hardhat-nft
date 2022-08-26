export type AttributeItem = {
    trait_type: string;
    value: any;
};

export interface MetadataTemplateInfo {
    name: string;
    description: string;
    image: string;
    attributes?: AttributeItem[];
}

export const metadataTemplate: MetadataTemplateInfo = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
};
