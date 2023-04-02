import * as wf from '@temporalio/workflow';
import type * as activities from './activities';

const {getArticle, getEditor, proofread, copyEdit, techEdit, formatEdit} = wf.proxyActivities<typeof activities>({
    //More info about startToCloseTimeout is here: https://docs.temporal.io/concepts/what-is-a-start-to-close-timeout/
    startToCloseTimeout: '4 seconds',
    retry: {
        backoffCoefficient: 1,
        maximumAttempts: 2,
    }
});

/**
NOTE: The workflow has a delay between the first and second activity
      as defined by the variable sleepPeriod. The delay is injected
      to emulate long running workflow behavior.
 */
export async function techPublishingWorkflow(): Promise<void> {
    //                  millisec * sec * min
    const sleepPeriod01 = (1000 * 60 * 3);
    const sleepPeriod02 = (1000 * 60 * 1);

    const startTime = new Date(Date.now()).toString();
    const article = await getArticle();

    let pr = '';
    let te = '';
    let ce = ''
    let fe = '';

    let v = 'Release_original';

    pr = await proofread(await getEditor(), article);

    await wf.sleep(sleepPeriod01);

    te = await techEdit(await getEditor(), article);

    await wf.sleep(sleepPeriod02);

    ce = await copyEdit(await getEditor(), article);

    fe = await formatEdit(await getEditor(), article);

    const endTime = new Date(Date.now()).toString();

    const techPub = {
        startTime,
        version: v,
        proofread: pr,
        techEdit: te,
        copyEdit: ce,
        formatEdit: fe,
        endTime
    }

    console.log(JSON.stringify(techPub, null, 2));
}


