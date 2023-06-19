/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {Grid, GridItem, SimpleGrid, Stack, Input, InputGroup, FormLabel, FormControl, FormErrorMessage} from '@chakra-ui/react'
import {usePlacesWidget} from 'react-google-autocomplete'
import useCustomer from '../../commerce-api/hooks/useCustomer'
import useAddressFields from './useAddressFields'
import Field from '../field'

const AddressFields = ({form, prefix = ''}) => {
    const customer = useCustomer()
    const fields = useAddressFields({form, prefix})
    const [address, setAddress] = useState('')

    const handleAddressChange = event => {
        setAddress(event.target.value)
    }

    const { ref } = usePlacesWidget({
        apiKey: api_key,
        onPlaceSelected: (place) => {
            if (place.address_components) {
                const stateCode = place.address_components.find((component) => component.types.includes('administrative_area_level_1'));
                const postalCode = place.address_components.find((component) => component.types.includes('postal_code'));
                const locality = place.address_components.find((component) => component.types.includes('locality'));
                const country = place.address_components.find((component) => component.types.includes('country'));
                const streetNumber = place.address_components.find((component) => component.types.includes('street_number'));
                const route = place.address_components.find((component) => component.types.includes('route'));
                
                if (stateCode?.short_name) {
                    form.setValue(`${prefix}stateCode`, stateCode.short_name);
                }
        
                if (postalCode?.short_name) {
                    form.setValue(`${prefix}postalCode`, postalCode.short_name);
                }

                if (locality?.short_name) {
                    form.setValue(`${prefix}city`, locality.short_name);
                }

                if (country?.short_name) {
                    form.setValue(`${prefix}countryCode`, country.short_name);
                }

                if (streetNumber?.short_name && route?.short_name) {
                    setAddress(`${streetNumber.short_name} ${route.short_name}`);
                    form.setValue(`${prefix}address1`, `${streetNumber.short_name} ${route.short_name}`);
                }
            }
        },
        options: {
            types: ['address'],
            componentRestrictions: { country: ['us', 'ca'] },
        },
    })

    return (
        <Stack spacing={5}>
            <SimpleGrid columns={[1, 1, 2]} gap={5}>
                <Field {...fields.firstName} />
                <Field {...fields.lastName} />
            </SimpleGrid>
            <Field {...fields.phone} />
            <Field {...fields.countryCode} />
            <FormControl id={fields.address1.name} isInvalid={fields.address1.error}>
                <FormLabel>{fields.address1.label}</FormLabel>
                <InputGroup>                
                    <Input ref={ref} placeholder='' onChange={handleAddressChange} value={address}/>
                </InputGroup>
                {fields.address1.error && !fields.address1.type !== 'hidden' && (
                    <FormErrorMessage>{fields.address1.message}</FormErrorMessage>
                )}
            </FormControl>
            <Field {...fields.city} />
            <Grid templateColumns="repeat(8, 1fr)" gap={5}>
                <GridItem colSpan={[4, 4, 4]}>
                    <Field {...fields.stateCode} />
                </GridItem>
                <GridItem colSpan={[4, 4, 4]}>
                    <Field {...fields.postalCode} />
                </GridItem>
            </Grid>
            {customer.isRegistered && <Field {...fields.preferred} />}
        </Stack>
    )
}

AddressFields.propTypes = {
    /** Object returned from `useForm` */
    form: PropTypes.object.isRequired,

    /** Optional prefix for field names */
    prefix: PropTypes.string
}

export default AddressFields
