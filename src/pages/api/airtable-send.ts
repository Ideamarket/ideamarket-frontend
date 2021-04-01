import Airtable from 'airtable'
import { NextApiRequest, NextApiResponse } from 'next'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.BASE_ID
)

const baseName = process.env.BASE_NAME

type Data = {
  message: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { email } = req.body

  try {
    await base(baseName).create(
      [
        {
          fields: {
            email,
          },
        },
      ],
      function (err, records) {
        if (err) {
          res
            .status(400)
            .json({ message: 'Something went wrong! Please try again!!' })
          console.error(err)
          return
        }
        records.forEach(function (record) {
          console.log(record)
        })
        res
          .status(200)
          .json({ message: 'Successfully added to our email list!' })
      }
    )
  } catch (e) {
    console.error(e)
    res
      .status(500)
      .json({ message: 'Something went wrong! Please try after sometime!!' })
  }
}

export default handler
