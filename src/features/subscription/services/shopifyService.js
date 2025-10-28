import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN;
const STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

if (!SHOPIFY_DOMAIN || !STOREFRONT_ACCESS_TOKEN) {
  console.error('Missing Shopify configuration. Please set VITE_SHOPIFY_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN in your .env file');
}

const client = createStorefrontApiClient({
  storeDomain: SHOPIFY_DOMAIN,
  apiVersion: '2024-01',
  publicAccessToken: STOREFRONT_ACCESS_TOKEN,
});

export const getProducts = async () => {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            tags
            images(first: 5) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            metafields(identifiers: [
              {namespace: "custom", key: "subscription_type"},
              {namespace: "custom", key: "subscription_duration"}
            ]) {
              key
              value
            }
          }
        }
      }
    }
  `;

  try {
    const {data, errors} = await client.request(query, {
      variables: { first: 10 }
    });

    if (errors) {
      console.error('GraphQL errors:', errors);
      throw new Error('Failed to fetch products');
    }

    return data.products.edges.map(edge => {
      const product = edge.node;
      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        tags: product.tags,
        images: product.images.edges.map(imgEdge => ({
          id: imgEdge.node.id,
          url: imgEdge.node.url,
          altText: imgEdge.node.altText,
          width: imgEdge.node.width,
          height: imgEdge.node.height
        })),
        variants: product.variants.edges.map(varEdge => ({
          id: varEdge.node.id,
          title: varEdge.node.title,
          price: parseFloat(varEdge.node.price.amount),
          currencyCode: varEdge.node.price.currencyCode,
          availableForSale: varEdge.node.availableForSale,
          selectedOptions: varEdge.node.selectedOptions
        })),
        metafields: product.metafields
          .filter(metafield => metafield !== null)
          .reduce((acc, metafield) => {
            acc[metafield.key] = metafield.value;
            return acc;
          }, {})
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createCart = async (lineItems) => {
  const mutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const cartInput = {
      input: {
        lines: lineItems.map(item => ({
          merchandiseId: item.variantId,
          quantity: item.quantity
        }))
      }
    };
    
    console.log('Creating cart with input:', JSON.stringify(cartInput, null, 2));
    
    const {data, errors} = await client.request(mutation, {
      variables: cartInput
    });

    if (errors) {
      console.error('GraphQL errors:', errors);
      const errorMessage = errors.graphQLErrors?.[0]?.message || 'Failed to create cart';
      throw new Error(errorMessage);
    }

    if (data.cartCreate.userErrors.length > 0) {
      console.error('Cart errors:', data.cartCreate.userErrors);
      throw new Error(data.cartCreate.userErrors[0].message);
    }

    return {
      id: data.cartCreate.cart.id,
      checkoutUrl: data.cartCreate.cart.checkoutUrl,
      lines: data.cartCreate.cart.lines.edges.map(edge => edge.node),
      totalPrice: parseFloat(data.cartCreate.cart.cost.totalAmount.amount),
      currencyCode: data.cartCreate.cart.cost.totalAmount.currencyCode
    };
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
};