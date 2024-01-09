---
title: 'Implementing semaphores with the C threads.h library'
pubDate: 2022-12-01
description: 'Implenting semaphores with the C11 threads.h library'
author: 'cjbohlman'
image: 'https://dev-to-uploads.s3.amazonaws.com/uploads/articles/v6o5yibibfpl5h8psdl9.png'
tags: ["C", "parallel programming", "learning in public"]
---
## Background

The C11 standard introduced a new optional threading library (threads.h) designed to be used instead of the POSIX threading libraries (pthreads).

This new library did not include a semaphore (sem_t) implementation. We can, however, build our own using the tools given to us in threads.h.

This guide assumes basic knowledge about multi-threading concepts (mutexes, semaphores, etc.)

## Requirements

To be able to follow this guide, you must be using an implementation of the C standard that has adopted the usage of threads.h.

To check if your compiler supports this, the macro `__STDC_NO_THREADS__` was added for checking.

```c
#ifdef __STDC_NO_THREADS__
#error This compiler does not support threads.h.
#endif
```

## Units of Multi-threading: A Primer

Semaphores are used for allowing a certain amount of threads to gain access to a resource at once. They differ from mutexes as semaphores can signal to other processes that they can attempt to access a critical section, whereas a mutex has to be unlocked by the same process/thread that locked it.

threads.h includes 2 locking mechanisms that can be used in tandem: mutexes and condition variables. The mutex is a binary semaphore, flipping between 1 and 0 to determine whether a thread can or can't access the section the mutex is guarding. The condition variables are used to tell threads to go to sleep when a certain event occurs, and to wake up when another event happens. And with just these 2 components, we can create a semaphore.

## Implementation

Our semaphore itself will have 3 variables.

1. A counter, containing how many more threads are able to access the resource the semaphore is guarding
2. A mutex, guarding access to the counter
3. A conditional variable, used for the signaling of other threads that are using the semaphore.

```c
typedef struct semaphore {
  mtx_t mtx;
  cnd_t cv;
  int count;
} sem_t;
```

The semaphore functions we will implement mirror the POSIX semaphore functions with slightly less complexity.

- `sem_init` will initialize the semaphore
- `sem_ post` will indicate the thread is done with the semaphore so other threads can attepmt to unlock it
- `sem_wait` will request to gain access to the critical section through the semaphore, putting the thread to sleep if the semaphore is full
- `sem_destroy` will de-allocate the semaphore

`sem_init` initializes the mutex and the conditional variable, as well as sets the counter to whatever is passed in the parameter.

```c
int sem_init(sem_t *sem, unsigned int value) {
  if (sem == NULL) {
    return -1;
  }

  mtx_init(&sem->mtx, mtx_plain);
  cnd_init(&sem->cv);
  sem->count = value;

  return 0;
}
```

`sem_wait` attempts to access the counter variable by blocking on the mutex. Once it obtains the mutex, the thread will block on the condition variable if the counter variable is equal to zero, meaning that no more space for resources is available. The conditional variable will take care of unlocking the mutex while the thread is asleep, so that the thread does not block other threads.

Once the thread wakes up and the counter is above zero, the thread will decrement the counter. It will unlock the mutex for the counter, and then return.

```c
int sem_wait(sem_t *sem) {
  if (sem == NULL) {
    return -1;
  }

  mtx_lock(&sem->mtx);
  while (sem->count == 0) {
    cnd_wait(&sem->cv, &sem->mtx);
  }

  sem->count--;

  mtx_unlock(&sem->mtx);
  return 0;
}
```

`sem_post` does the opposite of `sem_wait`, locking the mutex and incrementing the counter. The conditional variable is then signaled, allowing another thread a chance at gaining access to the semaphore. The mutex is then unlocked and the function returns.

```c
int sem_post(sem_t *sem) {
  if (sem == NULL) {
    return -1;
  }

  mtx_lock(&sem->mtx);

  sem->count++;

  cnd_signal(&sem->cv);
  mtx_unlock(&sem->mtx);
  return 0;
}
```

`sem_destroy` frees the mutex and the conditional variable such that no memory leaks will occur.

```c
int sem_destroy(sem_t *sem) {
  if (sem == NULL) {
    return -1;
  }

  mtx_destroy(&sem->mtx);
  cnd_destroy(&sem->cv);
  return 0;
}
```

## Application

This sample code will attempt to give only VALUE_COUNT_MAX threads access to the critical section through the semaphore.

```c
#include <stdio.h>
#include <unistd.h>
#include "semaphore.h"

#define VALUE_COUNT_MAX 5
#define THREAD_COUNT 10

sem_t sem;

int run(void *arg)
{
    (void)arg;

    sem_wait(&sem);
    printf("Thread: is reading!\n");

    sleep(2);

    printf("Thread: is exiting!\n");
    sem_post(&sem);

    return 0;
}

int main(void)
{
    thrd_t t[10];

    sem_init(&sem, VALUE_COUNT_MAX);

    // Spawn new threads

    int i;
    for (i = 0; i < THREAD_COUNT; i++) {
      thrd_create(&t[i], run, NULL);
    }

    int res;
    for (i = 0; i < THREAD_COUNT; i++) {
      thrd_join(t[i], &res);
    }

    sem_destroy(&sem);
}
```

## Conclusion

This has been a very brief guide on implementing basic semaphores in C11. POSIX semaphores have many other options that can be mirrored with the threads.h library. Any suggestions are appreciated, thank you for your time!

## Sources

[Beej's C Programming guide](https://beej.us/guide/bgc/html/split/multithreading.html) was very helpful for explaining the capabilities of the threads.h library.

[This GitHub repository](https://github.com/VladimirMarkelov/semaphore_c11) was helpful for verifying my implementation.
