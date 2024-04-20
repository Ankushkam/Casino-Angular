export const Payment_Methods={
    "methods": [
        {
            "brand": "trustly",
            "provider": "trustly",
            "id": "trustly-17",
            "type": "direct",
            "deposit": {
                "processing_time": "instant",
                "min": "15.00",
                "max": "1000.00",
                "commission_fixed": "0.00",
                "commission_percent": 0.0
            },
            "cashout": {
                "processing_time": "instant",
                "min": "15.00",
                "max": "100.00",
                "commission_fixed": "0.00",
                "commission_percent": 0.0
            }
        },
        {
            "brand": "neosurf",
            "provider": "apco",
            "id": "apco-neosurf-12",
            "type": "direct",
            "deposit": {
                "processing_time": "instant",
                "min": "1.00",
                "max": "100.00",
                "commission_fixed": "0.00",
                "commission_percent": 0.0
            },
            "cashout": {
                "processing_time": "instant",
                "min": "1.00",
                "max": "100.00",
                "commission_fixed": "0.00",
                "commission_percent": 0.0
            }
        },
        {
            "brand": "bank_transfer",
            "provider": "bank_transfer",
            "id": "bank_transfer-3",
            "type": "bank_transfer",
            "deposit": {
                "processing_time": {
                    "min": 1,
                    "max": 3
                },
                "min": "1.00",
                "max": "12000.00",
                "commission_fixed": "0.00",
                "commission_percent": 0.0
            },
            "cashout": {
                "processing_time": {
                    "min": 1,
                    "max": 3
                },
                "min": "20.00",
                "max": "1000.00",
                "commission_fixed": "0.00",
                "commission_percent": 0.0
            }
        },
        {
            "brand": "interac",
            "provider": "devcode",
            "id": "devcode-interac-8",
            "type": "bank_transfer",
            "cashout": {
                "processing_time": "instant",
                "min": "1.00",
                "max": "100.00",
                "commission_fixed": "0.00",
                "commission_percent": 0.0
            }
        }
    ]
}